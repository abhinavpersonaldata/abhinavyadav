import { createHash } from 'node:crypto'

const modelCatalogCache = new Map()
const MODEL_CATALOG_TTL_MS = 5 * 60 * 1000

const getProviderConfig = () => {
  const apiKey = process.env.AI_API_KEY?.trim()
  const baseUrl = process.env.AI_BASE_URL?.trim()

  if (!apiKey || !baseUrl) {
    throw new Error('AI_API_KEY and AI_BASE_URL must be configured on the backend.')
  }

  let parsedBaseUrl
  try {
    parsedBaseUrl = new URL(baseUrl)
  } catch {
    throw new Error('AI_BASE_URL must be a valid HTTP(S) URL.')
  }

  const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(parsedBaseUrl.hostname)
  if ((parsedBaseUrl.protocol !== 'https:' && !(parsedBaseUrl.protocol === 'http:' && isLoopback))
    || parsedBaseUrl.username
    || parsedBaseUrl.password) {
    throw new Error('AI_BASE_URL must use HTTPS, or HTTP for a loopback development server, without embedded credentials.')
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')
  const isVelona = parsedBaseUrl.hostname === 'velona.in'
    || parsedBaseUrl.hostname.endsWith('.velona.in')
  const endpoint = isVelona
    ? `${parsedBaseUrl.origin}/v1/chat/completions`
    : /\/chat\/completions$/i.test(normalizedBaseUrl)
      ? normalizedBaseUrl
      : `${normalizedBaseUrl}/chat/completions`
  const modelsEndpoint = isVelona
    ? `${parsedBaseUrl.origin}/gateway/v1/models`
    : /\/chat\/completions$/i.test(normalizedBaseUrl)
      ? normalizedBaseUrl.replace(/\/chat\/completions$/i, '/models')
      : `${normalizedBaseUrl}/models`

  return { apiKey, endpoint, modelsEndpoint }
}

const providerErrorForStatus = (status, action) => {
  if (status === 401 || status === 403) {
    return new Error('The AI service rejected the backend API key. Check AI_API_KEY.')
  }
  if (status === 402) {
    return new Error('The AI service account has insufficient credits. Check the provider wallet.')
  }
  if (status === 429) {
    return new Error('The AI service is rate-limiting requests. Please try again shortly.')
  }
  if (status === 404) {
    return new Error(`The AI service returned HTTP 404 while ${action}. Check AI_BASE_URL and the provider API route.`)
  }
  return new Error(`The AI service returned HTTP ${status} while ${action}.`)
}

const getModelCatalog = async ({ apiKey, modelsEndpoint }, fetchImpl) => {
  const apiKeyHash = createHash('sha256').update(apiKey).digest('hex')
  const cacheKey = `${modelsEndpoint}:${apiKeyHash}`
  const cached = modelCatalogCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.models

  let response
  try {
    response = await fetchImpl(modelsEndpoint, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(20_000),
    })
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error('The AI service timed out while loading its model catalog. Please try again.')
    }
    throw new Error('The AI service could not be reached while loading its model catalog. Check the backend network and AI_BASE_URL.')
  }

  if (!response.ok) throw providerErrorForStatus(response.status, 'loading its model catalog')

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('The AI service returned an invalid model catalog.')
  }

  const models = result?.data?.models
    || (Array.isArray(result?.data) ? result.data : null)
    || result?.models
  if (!Array.isArray(models) || !models.some((model) => typeof model?.id === 'string')) {
    throw new Error('The AI service returned no usable models in its model catalog.')
  }

  modelCatalogCache.set(cacheKey, { models, expiresAt: Date.now() + MODEL_CATALOG_TTL_MS })
  if (modelCatalogCache.size > 20) {
    const oldestKey = modelCatalogCache.keys().next().value
    modelCatalogCache.delete(oldestKey)
  }
  return models
}

const selectModels = (models, task, messages, maxTokens) => {
  const requiredCapabilities = task === 'vision' ? ['text', 'vision'] : ['text']
  const estimatedInputTokens = Math.ceil(JSON.stringify(messages).length / 4)
  const candidates = models
    .filter((model) => {
      if (typeof model?.id !== 'string') return false
      const type = typeof model.type === 'string' ? model.type.toLowerCase() : ''
      if (['image', 'embedding', 'audio', 'speech'].some((unsupportedType) => type.includes(unsupportedType))) return false
      if (/(?:^|[\/._-])(extract|summarize|summary|ocr|rerank|moderation|classifier)(?:$|[\/._-])/i.test(model.id)) return false
      if (Array.isArray(model.capabilities)) {
        return requiredCapabilities.every((capability) => model.capabilities.includes(capability))
      }
      return task !== 'vision'
        && !/(embedding|text-to-speech|speech-to-text|image-generation)/i.test(model.id)
    })
    .filter((model) => !Number.isFinite(model.context_window)
      || model.context_window >= estimatedInputTokens + maxTokens)

  if (!candidates.length) {
    const requiredCapability = task === 'vision' ? 'text and vision' : 'text'
    throw new Error(`The AI provider has no available model with ${requiredCapability} capability for this request.`)
  }

  const price = (model, key) => {
    const value = Number(model.pricing?.[key])
    return Number.isFinite(value) && value >= 0 ? value : null
  }
  const estimatedCost = (model) => {
    const inputPrice = price(model, 'input_per_1m_usd')
    const outputPrice = price(model, 'output_per_1m_usd')
    if (inputPrice === null || outputPrice === null) return null
    return (inputPrice * estimatedInputTokens + outputPrice * maxTokens) / 1_000_000
  }

  const sortedCandidates = candidates
    .map((model) => ({ model, cost: estimatedCost(model) }))
    .sort((left, right) => {
      if (left.cost === null && right.cost !== null) return 1
      if (left.cost !== null && right.cost === null) return -1
      if (left.cost !== null && right.cost !== null && left.cost !== right.cost) {
        return left.cost - right.cost
      }
      return left.model.id.localeCompare(right.model.id)
    })
  const selectedModels = []
  const selectedProviders = new Set()
  for (const { model } of sortedCandidates) {
    const provider = model.provider || model.id.split('/')[0]
    if (selectedProviders.has(provider)) continue
    selectedProviders.add(provider)
    selectedModels.push(model.id)
    if (selectedModels.length === 3) break
  }
  return selectedModels
}

export const requestChatCompletion = async (messages, options = {}, fetchImpl = fetch) => {
  const config = getProviderConfig()
  const task = options.task === 'vision' ? 'vision' : 'chat'
  const jsonMode = options.jsonMode === true
  const maxTokens = options.maxTokens ?? 700
  const models = await getModelCatalog(config, fetchImpl)
  const selectedModels = selectModels(models, task, messages, maxTokens)
  let jsonModeUnsupported = false

  for (const model of selectedModels) {
    let response
    try {
      response = await fetchImpl(config.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.2,
          max_tokens: maxTokens,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        }),
        signal: AbortSignal.timeout(60_000),
      })
    } catch (error) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new Error('The AI service timed out. Please try again.')
      }
      throw new Error('The AI service could not be reached. Check the backend network and AI_BASE_URL.')
    }

    if (response.status === 429) continue
    if (jsonMode && [400, 422].includes(response.status)) {
      jsonModeUnsupported = true
      continue
    }
    if (!response.ok) throw providerErrorForStatus(response.status, 'generating a response')

    const result = await response.json().catch(() => null)
    const content = result?.choices?.[0]?.message?.content
    const text = Array.isArray(content)
      ? content.map((part) => typeof part?.text === 'string' ? part.text : '').join('')
      : content

    if (typeof text !== 'string' || !text.trim()) {
      throw new Error('The AI service returned an empty response. Please try again.')
    }

    return text.trim()
  }

  if (jsonMode && jsonModeUnsupported) {
    return requestChatCompletion(messages, { ...options, jsonMode: false }, fetchImpl)
  }

  throw providerErrorForStatus(429, 'generating a response')
}

export const getProviderConfigStatus = () => ({
  configured: Boolean(
    process.env.AI_API_KEY?.trim()
    && process.env.AI_BASE_URL?.trim()
  ),
})

const getProviderConfig = () => {
  const apiKey = process.env.AI_API_KEY?.trim()
  const baseUrl = process.env.AI_BASE_URL?.trim()
  const model = process.env.AI_MODEL?.trim()

  if (!apiKey || !baseUrl || !model) {
    throw new Error('AI_API_KEY, AI_BASE_URL, and AI_MODEL must be configured on the backend.')
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
  const endpoint = /\/chat\/completions$/i.test(normalizedBaseUrl)
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/chat/completions`

  return { apiKey, endpoint, model }
}

export const requestChatCompletion = async (messages, options = {}, fetchImpl = fetch) => {
  const { apiKey, endpoint, model } = getProviderConfig()
  let response
  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 700,
      }),
      signal: AbortSignal.timeout(60_000),
    })
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error('The AI service timed out. Please try again.')
    }
    throw new Error('The AI service could not be reached. Check the backend network and AI_BASE_URL.')
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('The AI service rejected the backend API key. Check AI_API_KEY.')
    }
    if (response.status === 429) {
      throw new Error('The AI service is rate-limiting requests. Please try again shortly.')
    }
    throw new Error(`The AI service returned HTTP ${response.status}. Check AI_BASE_URL and AI_MODEL.`)
  }

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

export const getProviderConfigStatus = () => ({
  configured: Boolean(
    process.env.AI_API_KEY?.trim()
    && process.env.AI_BASE_URL?.trim()
    && process.env.AI_MODEL?.trim(),
  ),
})

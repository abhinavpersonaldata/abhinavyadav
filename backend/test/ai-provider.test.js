import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { requestChatCompletion } from '../ai-provider.js'

const originalEnv = {
  AI_API_KEY: process.env.AI_API_KEY,
  AI_BASE_URL: process.env.AI_BASE_URL,
}

afterEach(() => {
  Object.entries(originalEnv).forEach(([key, value]) => {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  })
})

const textModel = {
  id: 'vendor/text-budget',
  type: 'text',
  capabilities: ['text'],
  context_window: 8192,
  pricing: { input_per_1m_usd: 0.1, output_per_1m_usd: 0.1 },
}

const visionModel = {
  id: 'vendor/vision-budget',
  type: 'text',
  capabilities: ['text', 'vision'],
  context_window: 8192,
  pricing: { input_per_1m_usd: 0.2, output_per_1m_usd: 0.2 },
}

const specializedModel = {
  id: 'vendor/extract',
  type: 'text',
  capabilities: ['text'],
  context_window: 8192,
  pricing: { input_per_1m_usd: 0, output_per_1m_usd: 0 },
}

const backupTextModel = {
  id: 'backup/text-model',
  type: 'text',
  capabilities: ['text'],
  context_window: 8192,
  pricing: { input_per_1m_usd: 0.3, output_per_1m_usd: 0.3 },
}

test('maps Velona native base URLs and selects an affordable text model dynamically', async () => {
  process.env.AI_API_KEY = 'test-key-chat'
  process.env.AI_BASE_URL = 'https://velona.in/gateway/v1/'
  const requests = []

  const answer = await requestChatCompletion(
    [{ role: 'user', content: 'Hello' }],
    { maxTokens: 20 },
    async (url, options) => {
      requests.push({ url, options })
      if (url === 'https://velona.in/gateway/v1/models') {
        return Response.json({ data: { models: [specializedModel, visionModel, textModel] } })
      }
      return Response.json({ choices: [{ message: { content: 'Hello back' } }] })
    },
  )

  assert.equal(requests[0].url, 'https://velona.in/gateway/v1/models')
  assert.equal(requests[0].options.headers.Authorization, 'Bearer test-key-chat')
  assert.equal(requests[1].url, 'https://velona.in/v1/chat/completions')
  assert.equal(requests[1].options.headers.Authorization, 'Bearer test-key-chat')
  assert.equal(JSON.parse(requests[1].options.body).model, textModel.id)
  assert.equal(answer, 'Hello back')
})

test('tries a different provider when the cheapest model is rate-limited', async () => {
  process.env.AI_API_KEY = 'test-key-fallback'
  process.env.AI_BASE_URL = 'https://velona.in/gateway/v1'
  const selectedModels = []

  const answer = await requestChatCompletion(
    [{ role: 'user', content: 'Hello' }],
    { maxTokens: 20 },
    async (url, options) => {
      if (url.endsWith('/models')) {
        return Response.json({ data: { models: [textModel, backupTextModel] } })
      }
      const { model } = JSON.parse(options.body)
      selectedModels.push(model)
      return model === textModel.id
        ? new Response(null, { status: 429 })
        : Response.json({ choices: [{ message: { content: 'Hello from backup' } }] })
    },
  )

  assert.deepEqual(selectedModels, [textModel.id, backupTextModel.id])
  assert.equal(answer, 'Hello from backup')
})

test('selects a vision-capable model for document extraction', async () => {
  process.env.AI_API_KEY = 'test-key-vision'
  process.env.AI_BASE_URL = 'https://velona.in/gateway/v1'
  let requestBody

  await requestChatCompletion(
    [{ role: 'user', content: [{ type: 'image_url', image_url: { url: 'data:image/png;base64,AA==' } }] }],
    { maxTokens: 20, task: 'vision' },
    async (url, options) => {
      if (url.endsWith('/models')) {
        return Response.json({ data: { models: [textModel, visionModel] } })
      }
      requestBody = JSON.parse(options.body)
      return Response.json({ choices: [{ message: { content: '{"title":"Test"}' } }] })
    },
  )

  assert.equal(requestBody.model, visionModel.id)
})

test('reports provider endpoint errors without referring to a fixed model setting', async () => {
  process.env.AI_API_KEY = 'test-key-404'
  process.env.AI_BASE_URL = 'https://ai.example/v1'

  await assert.rejects(
    requestChatCompletion([{ role: 'user', content: 'Hello' }], {}, async () => new Response(null, { status: 404 })),
    /HTTP 404 while loading its model catalog.*AI_BASE_URL/,
  )
})

test('reports missing provider configuration instead of returning a fake answer', async () => {
  delete process.env.AI_API_KEY
  delete process.env.AI_BASE_URL

  await assert.rejects(
    requestChatCompletion([{ role: 'user', content: 'Hello' }]),
    /AI_API_KEY and AI_BASE_URL must be configured/,
  )
})

test('does not send API keys to non-local HTTP endpoints', async () => {
  process.env.AI_API_KEY = 'test-key'
  process.env.AI_BASE_URL = 'http://ai.example/v1'

  await assert.rejects(
    requestChatCompletion([{ role: 'user', content: 'Hello' }]),
    /must use HTTPS/,
  )
})

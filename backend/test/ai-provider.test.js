import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { requestChatCompletion } from '../ai-provider.js'

const originalEnv = {
  AI_API_KEY: process.env.AI_API_KEY,
  AI_BASE_URL: process.env.AI_BASE_URL,
  AI_MODEL: process.env.AI_MODEL,
}

afterEach(() => {
  Object.entries(originalEnv).forEach(([key, value]) => {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  })
})

test('calls the configured OpenAI-compatible chat-completions endpoint', async () => {
  process.env.AI_API_KEY = 'test-key'
  process.env.AI_BASE_URL = 'https://ai.example/v1/'
  process.env.AI_MODEL = 'test-model'
  let request

  const answer = await requestChatCompletion(
    [{ role: 'user', content: 'Hello' }],
    {},
    async (url, options) => {
      request = { url, options }
      return Response.json({ choices: [{ message: { content: 'Hello back' } }] })
    },
  )

  assert.equal(request.url, 'https://ai.example/v1/chat/completions')
  assert.equal(request.options.headers.Authorization, 'Bearer test-key')
  assert.equal(JSON.parse(request.options.body).model, 'test-model')
  assert.equal(answer, 'Hello back')
})

test('reports missing provider configuration instead of returning a fake answer', async () => {
  delete process.env.AI_API_KEY
  delete process.env.AI_BASE_URL
  delete process.env.AI_MODEL

  await assert.rejects(
    requestChatCompletion([{ role: 'user', content: 'Hello' }]),
    /AI_API_KEY, AI_BASE_URL, and AI_MODEL must be configured/,
  )
})

test('does not send API keys to non-local HTTP endpoints', async () => {
  process.env.AI_API_KEY = 'test-key'
  process.env.AI_BASE_URL = 'http://ai.example/v1'
  process.env.AI_MODEL = 'test-model'

  await assert.rejects(
    requestChatCompletion([{ role: 'user', content: 'Hello' }]),
    /must use HTTPS/,
  )
})

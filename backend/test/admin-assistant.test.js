import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseAdminAssistantResponse, validateAdminAssistantChanges } from '../admin-assistant.js'

test('parses a structured chat reply with an editable portfolio proposal', () => {
  const result = parseAdminAssistantResponse(`\`\`\`json
{"reply":"I can update the introduction.","changes":[{"op":"replace","path":"/about/homepageIntro","value":"A new introduction."}]}
\`\`\``)

  assert.equal(result.reply, 'I can update the introduction.')
  assert.deepEqual(result.changes, [
    { op: 'replace', path: '/about/homepageIntro', value: 'A new introduction.' },
  ])
})

test('allows normal chat responses without portfolio changes', () => {
  assert.deepEqual(parseAdminAssistantResponse('{"reply":"React is a UI library.","changes":[]}'), {
    reply: 'React is a UI library.',
    changes: [],
  })
})

test('parses structured replies surrounded by provider commentary', () => {
  const result = parseAdminAssistantResponse(
    'Here is the result:\n```json\n{"reply":"The intro can include {curly braces}.","changes":[]}\n```\nDone.',
  )

  assert.deepEqual(result, {
    reply: 'The intro can include {curly braces}.',
    changes: [],
  })
})

test('rejects private, unsafe, multi-section, and project-delete proposals', () => {
  assert.throws(
    () => validateAdminAssistantChanges([{ op: 'replace', path: '/adminAccessSettings/unlockPattern', value: [1, 2, 3] }]),
    /outside editable portfolio content/,
  )
  assert.throws(
    () => validateAdminAssistantChanges([{ op: 'replace', path: '/about/__proto__/polluted', value: true }]),
    /outside editable portfolio content/,
  )
  assert.throws(
    () => validateAdminAssistantChanges([
      { op: 'replace', path: '/about/homepageIntro', value: 'New intro' },
      { op: 'replace', path: '/profile/name', value: 'New name' },
    ]),
    /one portfolio section/,
  )
  assert.throws(
    () => validateAdminAssistantChanges([{ op: 'remove', path: '/projects/0' }]),
    /not deleted/,
  )
})

test('rejects unsafe keys inside proposed values', () => {
  assert.throws(
    () => validateAdminAssistantChanges([{
      op: 'add',
      path: '/about/facts/-',
      value: { label: 'Fact', constructor: { polluted: true } },
    }]),
    /unsafe or oversized/,
  )
})

test('keeps plain-text replies as chat without applying changes', () => {
  assert.deepEqual(parseAdminAssistantResponse('Hello! How can I help?'), {
    reply: 'Hello! How can I help?',
    changes: [],
    notice: 'No website changes were applied because the assistant did not return a reviewable proposal.',
  })
})

test('rejects incomplete structured model output', () => {
  assert.throws(
    () => parseAdminAssistantResponse('{"reply":"","changes":[]}'),
    /invalid response/,
  )
})

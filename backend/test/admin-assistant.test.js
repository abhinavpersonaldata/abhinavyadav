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

test('rejects malformed or incomplete model output', () => {
  assert.throws(() => parseAdminAssistantResponse('not JSON'), /readable response/)
  assert.throws(
    () => parseAdminAssistantResponse('{"reply":"","changes":[]}'),
    /invalid response/,
  )
})

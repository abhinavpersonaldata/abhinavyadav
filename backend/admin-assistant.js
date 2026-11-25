import { ADMIN_AI_EDITABLE_ROOTS } from './adminAiPortfolio.js'

const editableRoots = new Set(ADMIN_AI_EDITABLE_ROOTS)

const decodePointerSegment = (segment) => {
  if (/~(?![01])/.test(segment)) throw new Error('The assistant proposed an invalid change path.')
  return segment.replace(/~1/g, '/').replace(/~0/g, '~')
}

const hasUnsafeDataKey = (value) => {
  if (!value || typeof value !== 'object') return false
  if (Array.isArray(value)) return value.some(hasUnsafeDataKey)
  return Object.entries(value).some(([key, child]) => (
    ['__proto__', 'prototype', 'constructor', 'adminAccessSettings'].includes(key)
    || hasUnsafeDataKey(child)
  ))
}

const isAssistantResponse = (value) => (
  value
  && typeof value === 'object'
  && !Array.isArray(value)
  && typeof value.reply === 'string'
  && Array.isArray(value.changes)
)

const findAssistantResponse = (text) => {
  for (let start = 0; start < text.length; start += 1) {
    if (text[start] !== '{') continue

    let depth = 0
    let inString = false
    let isEscaped = false
    for (let end = start; end < text.length; end += 1) {
      const character = text[end]
      if (inString) {
        if (isEscaped) isEscaped = false
        else if (character === '\\') isEscaped = true
        else if (character === '"') inString = false
        continue
      }
      if (character === '"') inString = true
      else if (character === '{') depth += 1
      else if (character === '}') {
        depth -= 1
        if (depth === 0) {
          try {
            const parsed = JSON.parse(text.slice(start, end + 1))
            if (isAssistantResponse(parsed)) return parsed
          } catch {
            break
          }
          break
        }
      }
    }
  }
  return null
}

export const validateAdminAssistantChanges = (changes) => {
  if (!Array.isArray(changes) || changes.length > 8) {
    throw new Error('The assistant returned too many proposed changes.')
  }

  let root
  let projectRecord
  return changes.map((change) => {
    if (!change || !['add', 'replace', 'remove'].includes(change.op) || typeof change.path !== 'string') {
      throw new Error('The assistant returned an unsupported change operation.')
    }

    const segments = change.path.startsWith('/')
      ? change.path.slice(1).split('/').map(decodePointerSegment)
      : []
    if (segments.length < 2
      || segments.some((segment) => segment === '')
      || segments.some((segment) => ['__proto__', 'prototype', 'constructor', 'adminAccessSettings'].includes(segment))
      || !editableRoots.has(segments[0])) {
      throw new Error('The assistant proposed a change outside editable portfolio content.')
    }

    if (root && root !== segments[0]) {
      throw new Error('Apply one portfolio section per instruction.')
    }
    root = segments[0]

    if (root === 'projects') {
      if ((change.op === 'remove' && segments.length === 2)
        || (segments.length === 2 && !(change.op === 'add' && segments[1] === '-'))
        || segments[2] === 'id') {
        throw new Error('Projects can be added or edited here, but not deleted or re-identified.')
      }
      if (projectRecord !== undefined && projectRecord !== segments[1]) {
        throw new Error('Update one project per instruction.')
      }
      projectRecord = segments[1]
    }

    if (change.op !== 'remove') {
      if (!Object.hasOwn(change, 'value')) {
        throw new Error('The assistant returned a change without a value.')
      }
      const serializedValue = JSON.stringify(change.value)
      if (serializedValue === undefined || serializedValue.length > 20_000 || hasUnsafeDataKey(change.value)) {
        throw new Error('The assistant returned an unsafe or oversized portfolio change.')
      }
      return { op: change.op, path: change.path, value: change.value }
    }
    return { op: change.op, path: change.path }
  })
}

export const parseAdminAssistantResponse = (responseText) => {
  if (typeof responseText !== 'string') {
    throw new Error('The assistant returned an unstructured response. Please try again.')
  }

  const jsonText = responseText
    .replace(/^\uFEFF/, '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  let result
  try {
    result = JSON.parse(jsonText)
  } catch {
    result = findAssistantResponse(jsonText)
    if (!result) {
      const reply = jsonText.trim()
      if (!reply) throw new Error('The assistant returned an empty response. Please try again.')
      return {
        reply: reply.slice(0, 3000),
        changes: [],
        notice: 'No website changes were applied because the assistant did not return a reviewable proposal.',
      }
    }
  }

  if (!isAssistantResponse(result) || !result.reply.trim()) {
    throw new Error('The assistant returned an invalid response. Please try again.')
  }

  return {
    reply: result.reply.trim().slice(0, 3000),
    changes: validateAdminAssistantChanges(result.changes),
  }
}

import { ADMIN_AI_EDITABLE_ROOTS } from '../../../backend/adminAiPortfolio.js'

const editableRoots = new Set(ADMIN_AI_EDITABLE_ROOTS)

const decodePointerSegment = (segment) => {
  if (/~(?![01])/.test(segment)) throw new Error('The proposed change path is invalid.')
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

const clone = (value) => JSON.parse(JSON.stringify(value))

const getArrayIndex = (segment, length, allowEnd = false) => {
  if (!/^(0|[1-9]\d*)$/.test(segment)) throw new Error('The proposed change contains an invalid list position.')
  const index = Number(segment)
  if (!Number.isSafeInteger(index) || index >= length + (allowEnd ? 1 : 0)) {
    throw new Error('The proposed change refers to a missing list item.')
  }
  return index
}

export const applyAdminPortfolioChanges = (portfolio, changes) => {
  if (!portfolio || typeof portfolio !== 'object' || Array.isArray(portfolio)
    || !Array.isArray(changes) || changes.length === 0 || changes.length > 8) {
    throw new Error('There are no valid portfolio changes to apply.')
  }

  const updated = clone(portfolio)
  let root
  let projectRecord

  changes.forEach((change) => {
    if (!change || !['add', 'replace', 'remove'].includes(change.op) || typeof change.path !== 'string') {
      throw new Error('The proposed change operation is invalid.')
    }

    const segments = change.path.startsWith('/')
      ? change.path.slice(1).split('/').map(decodePointerSegment)
      : []
    if (segments.length < 2
      || segments.some((segment) => segment === '')
      || segments.some((segment) => ['__proto__', 'prototype', 'constructor', 'adminAccessSettings'].includes(segment))
      || !editableRoots.has(segments[0])) {
      throw new Error('The proposed change is outside editable portfolio content.')
    }

    if (root && root !== segments[0]) throw new Error('Apply one portfolio section per instruction.')
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

    if (change.op !== 'remove' && (hasUnsafeDataKey(change.value) || !Object.hasOwn(change, 'value'))) {
      throw new Error('The proposed change contains unsafe or missing data.')
    }
    const value = change.op === 'remove' ? undefined : clone(change.value)
    let parent = updated
    for (const segment of segments.slice(0, -1)) {
      if (Array.isArray(parent)) {
        parent = parent[getArrayIndex(segment, parent.length)]
      } else if (parent && typeof parent === 'object' && Object.hasOwn(parent, segment)) {
        parent = parent[segment]
      } else {
        throw new Error('The proposed change refers to a missing portfolio field.')
      }
    }

    const key = segments[segments.length - 1]
    if (Array.isArray(parent)) {
      if (change.op === 'add') {
        const index = key === '-' ? parent.length : getArrayIndex(key, parent.length, true)
        parent.splice(index, 0, value)
      } else {
        const index = getArrayIndex(key, parent.length)
        if (change.op === 'remove') parent.splice(index, 1)
        else parent[index] = value
      }
    } else if (parent && typeof parent === 'object') {
      const exists = Object.hasOwn(parent, key)
      if (change.op === 'replace' && !exists) {
        throw new Error('The proposed change refers to a missing portfolio field.')
      }
      if (change.op === 'remove') {
        if (!exists) throw new Error('The proposed change refers to a missing portfolio field.')
        delete parent[key]
      } else {
        parent[key] = value
      }
    } else {
      throw new Error('The proposed change path is invalid.')
    }
  })

  return updated
}

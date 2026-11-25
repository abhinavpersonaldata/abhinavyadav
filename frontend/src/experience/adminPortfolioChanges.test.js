import assert from 'node:assert/strict'
import { test } from 'node:test'
import { applyAdminPortfolioChanges } from './adminPortfolioChanges.js'

test('applies reviewed edits and additions without mutating the current portfolio', () => {
  const portfolio = {
    about: {
      homepageIntro: 'Old introduction',
      certificates: [],
    },
  }
  const updated = applyAdminPortfolioChanges(portfolio, [
    { op: 'replace', path: '/about/homepageIntro', value: 'New introduction' },
    {
      op: 'add',
      path: '/about/certificates/-',
      value: { title: 'Frontend Basics', issuer: 'Example Academy' },
    },
  ])

  assert.equal(portfolio.about.homepageIntro, 'Old introduction')
  assert.equal(updated.about.homepageIntro, 'New introduction')
  assert.deepEqual(updated.about.certificates, [
    { title: 'Frontend Basics', issuer: 'Example Academy' },
  ])
})

test('rejects edits outside editable roots and project deletion', () => {
  const portfolio = { about: { homepageIntro: 'Original' }, projects: [{ id: 'one' }] }

  assert.throws(
    () => applyAdminPortfolioChanges(portfolio, [{ op: 'replace', path: '/adminAccessSettings/unlockPattern/0', value: 1 }]),
    /outside editable portfolio content/,
  )
  assert.throws(
    () => applyAdminPortfolioChanges(portfolio, [{ op: 'remove', path: '/projects/0' }]),
    /not deleted/,
  )
  assert.equal(portfolio.about.homepageIntro, 'Original')
})

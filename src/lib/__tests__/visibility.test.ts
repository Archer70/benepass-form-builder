import { describe, it, expect } from 'vitest'
import { evaluateCondition, isFieldVisible } from '../visibility'
import type { FormField, VisibilityCondition } from '../types'

const baseField: FormField = { id: '1', type: 'text', name: 'state', label: 'State' }

describe('evaluateCondition', () => {
  const cases: [VisibilityCondition, Record<string, unknown>, boolean][] = [
    [{ field: 'country', operator: 'equals', value: 'US' }, { country: 'US' }, true],
    [{ field: 'country', operator: 'equals', value: 'US' }, { country: 'CA' }, false],
    [{ field: 'country', operator: 'notEquals', value: 'US' }, { country: 'CA' }, true],
    [{ field: 'country', operator: 'in', value: ['US', 'CA'] }, { country: 'CA' }, true],
    [{ field: 'country', operator: 'in', value: ['US', 'CA'] }, { country: 'UK' }, false],
    [{ field: 'newsletter', operator: 'truthy' }, { newsletter: true }, true],
    [{ field: 'newsletter', operator: 'truthy' }, { newsletter: false }, false],
  ]

  it.each(cases)('evaluates %o against %o -> %s', (condition, values, expected) => {
    expect(evaluateCondition(condition, values)).toBe(expected)
  })
})

describe('isFieldVisible', () => {
  it('is always visible without a condition', () => {
    expect(isFieldVisible(baseField, {})).toBe(true)
  })

  it('respects the visibility condition', () => {
    const f = { ...baseField, visibleWhen: { field: 'country', operator: 'equals' as const, value: 'US' } }
    expect(isFieldVisible(f, { country: 'US' })).toBe(true)
    expect(isFieldVisible(f, { country: 'CA' })).toBe(false)
  })
})

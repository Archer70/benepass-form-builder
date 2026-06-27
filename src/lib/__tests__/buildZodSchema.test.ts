import { describe, it, expect } from 'vitest'
import { buildZodSchema } from '../buildZodSchema'
import type { FormField } from '../types'

function field(partial: Partial<FormField> & Pick<FormField, 'type' | 'name'>): FormField {
  return {
    id: partial.name,
    label: partial.name,
    ...partial,
  } as FormField
}

describe('buildZodSchema', () => {
  it('rejects empty required text and accepts filled', () => {
    const fields = [field({ type: 'text', name: 'a', required: true })]
    expect(buildZodSchema(fields, { a: '' }).safeParse({ a: '' }).success).toBe(false)
    expect(buildZodSchema(fields, { a: 'hi' }).safeParse({ a: 'hi' }).success).toBe(true)
  })

  it('allows empty optional text', () => {
    const fields = [field({ type: 'text', name: 'a' })]
    expect(buildZodSchema(fields, { a: '' }).safeParse({ a: '' }).success).toBe(true)
  })

  it('enforces min/max length on strings', () => {
    const fields = [field({ type: 'text', name: 'a', validation: { min: 2, max: 4 } })]
    expect(buildZodSchema(fields, { a: 'x' }).safeParse({ a: 'x' }).success).toBe(false)
    expect(buildZodSchema(fields, { a: 'xxxxx' }).safeParse({ a: 'xxxxx' }).success).toBe(false)
    expect(buildZodSchema(fields, { a: 'xxx' }).safeParse({ a: 'xxx' }).success).toBe(true)
  })

  it('coerces numbers and enforces min/max value', () => {
    const fields = [field({ type: 'number', name: 'n', validation: { min: 18, max: 120 } })]
    expect(buildZodSchema(fields, { n: '17' }).safeParse({ n: '17' }).success).toBe(false)
    expect(buildZodSchema(fields, { n: '21' }).safeParse({ n: '21' }).success).toBe(true)
    const parsed = buildZodSchema(fields, { n: '21' }).safeParse({ n: '21' })
    expect(parsed.success && parsed.data.n).toBe(21)
  })

  it('flags non-numeric input on number fields', () => {
    const fields = [field({ type: 'number', name: 'n', required: true })]
    expect(buildZodSchema(fields, { n: 'abc' }).safeParse({ n: 'abc' }).success).toBe(false)
  })

  it('requires checkbox to be true when required', () => {
    const fields = [field({ type: 'checkbox', name: 'terms', required: true })]
    expect(buildZodSchema(fields, { terms: false }).safeParse({ terms: false }).success).toBe(false)
    expect(buildZodSchema(fields, { terms: true }).safeParse({ terms: true }).success).toBe(true)
  })

  it('applies regex rules', () => {
    const fields = [
      field({ type: 'text', name: 'email', validation: { regex: { pattern: '^[^@]+@[^@]+$' } } }),
    ]
    expect(buildZodSchema(fields, { email: 'nope' }).safeParse({ email: 'nope' }).success).toBe(
      false,
    )
    expect(
      buildZodSchema(fields, { email: 'a@b' }).safeParse({ email: 'a@b' }).success,
    ).toBe(true)
  })

  it('applies custom rules', () => {
    const fields = [
      field({ type: 'text', name: 'u', validation: { custom: { expression: 'value !== "admin"' } } }),
    ]
    expect(buildZodSchema(fields, { u: 'admin' }).safeParse({ u: 'admin' }).success).toBe(false)
    expect(buildZodSchema(fields, { u: 'jane' }).safeParse({ u: 'jane' }).success).toBe(true)
  })

  it('excludes hidden fields from validation', () => {
    const fields = [
      field({ type: 'select', name: 'country' }),
      field({
        type: 'text',
        name: 'state',
        required: true,
        visibleWhen: { field: 'country', operator: 'equals', value: 'US' },
      }),
    ]
    // country !== US -> state hidden -> empty state should NOT fail
    expect(
      buildZodSchema(fields, { country: 'CA', state: '' }).safeParse({ country: 'CA', state: '' })
        .success,
    ).toBe(true)
    // country === US -> state visible & required -> empty fails
    expect(
      buildZodSchema(fields, { country: 'US', state: '' }).safeParse({ country: 'US', state: '' })
        .success,
    ).toBe(false)
  })
})

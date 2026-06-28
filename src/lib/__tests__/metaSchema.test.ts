import { describe, it, expect } from 'vitest'
import { parseFormSchema } from '../metaSchema'
import type { FormField } from '../types'

function field(partial: Partial<FormField> & Pick<FormField, 'type' | 'name' | 'id'>): FormField {
  return { label: partial.name, ...partial } as FormField
}

function schemaJson(fields: FormField[]): string {
  return JSON.stringify({ version: 1, title: 'T', fields })
}

describe('parseFormSchema', () => {
  it('accepts a well-formed schema', () => {
    const json = schemaJson([
      field({ id: 'a', type: 'text', name: 'first' }),
      field({ id: 'b', type: 'select', name: 'country', options: [{ label: 'US', value: 'US' }] }),
    ])
    expect(parseFormSchema(json).success).toBe(true)
  })

  it('rejects invalid JSON', () => {
    expect(parseFormSchema('{not json').success).toBe(false)
  })

  it('rejects duplicate field names', () => {
    const json = schemaJson([
      field({ id: 'a', type: 'text', name: 'dup' }),
      field({ id: 'b', type: 'text', name: 'dup' }),
    ])
    const result = parseFormSchema(json)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/duplicate field name/i)
  })

  it('rejects duplicate field ids', () => {
    const json = schemaJson([
      field({ id: 'same', type: 'text', name: 'a' }),
      field({ id: 'same', type: 'text', name: 'b' }),
    ])
    const result = parseFormSchema(json)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/duplicate field id/i)
  })

  it('rejects select/radio without options', () => {
    const json = schemaJson([field({ id: 'a', type: 'select', name: 'c' })])
    const result = parseFormSchema(json)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/option/i)
  })

  it('rejects visibleWhen referencing an unknown field', () => {
    const json = schemaJson([
      field({
        id: 'a',
        type: 'text',
        name: 'state',
        visibleWhen: { field: 'country', operator: 'equals', value: 'US' },
      }),
    ])
    const result = parseFormSchema(json)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/unknown field/i)
  })

  it('rejects unknown / misspelled keys (strict)', () => {
    const json = JSON.stringify({
      version: 1,
      title: 'T',
      fields: [{ id: 'a', type: 'text', name: 'first', label: 'First', requied: true }],
    })
    expect(parseFormSchema(json).success).toBe(false)
  })

  it('rejects an invalid regex pattern', () => {
    const json = schemaJson([
      field({ id: 'a', type: 'text', name: 'a', validation: { regex: { pattern: '([' } } }),
    ])
    const result = parseFormSchema(json)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/invalid regex/i)
  })

  it('rejects an unparseable custom rule', () => {
    const json = schemaJson([
      field({ id: 'a', type: 'text', name: 'a', validation: { custom: { expression: 'value >=' } } }),
    ])
    const result = parseFormSchema(json)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/invalid custom rule/i)
  })

  it('rejects mismatched visibleWhen operator/value shapes', () => {
    const inWithScalar = schemaJson([
      field({ id: 'a', type: 'text', name: 'country' }),
      field({
        id: 'b',
        type: 'text',
        name: 'state',
        visibleWhen: { field: 'country', operator: 'in', value: 'US' },
      }),
    ])
    expect(parseFormSchema(inWithScalar).success).toBe(false)

    const equalsWithList = schemaJson([
      field({ id: 'a', type: 'text', name: 'country' }),
      field({
        id: 'b',
        type: 'text',
        name: 'state',
        visibleWhen: { field: 'country', operator: 'equals', value: ['US', 'CA'] },
      }),
    ])
    expect(parseFormSchema(equalsWithList).success).toBe(false)
  })

  it('accepts valid regex, custom rule, and in-list condition', () => {
    const json = schemaJson([
      field({ id: 'a', type: 'text', name: 'country' }),
      field({
        id: 'b',
        type: 'text',
        name: 'email',
        validation: {
          regex: { pattern: '^.+@.+$' },
          custom: { expression: 'value.length >= 3' },
        },
        visibleWhen: { field: 'country', operator: 'in', value: ['US', 'CA'] },
      }),
    ])
    expect(parseFormSchema(json).success).toBe(true)
  })
})

import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { resolveFormValues, mapZodErrors, createFormResolver } from '../formResolver'
import type { FormField } from '../types'

const field = (over: Partial<FormField> & Pick<FormField, 'name'>): FormField => ({
  id: over.id ?? over.name,
  type: 'text',
  label: over.name,
  ...over,
})

describe('resolveFormValues', () => {
  it('returns the values and no errors when valid', () => {
    const fields = [field({ name: 'fullName', label: 'Full name', required: true })]
    const result = resolveFormValues(fields, { fullName: 'Ada' })
    expect(result.errors).toEqual({})
    expect(result.values).toEqual({ fullName: 'Ada' })
  })

  it('reports an error for a missing required field', () => {
    const fields = [field({ name: 'fullName', label: 'Full name', required: true })]
    const result = resolveFormValues(fields, { fullName: '' })
    expect(result.values).toEqual({})
    expect((result.errors as Record<string, { message: string }>).fullName.message).toBe(
      'Full name is required',
    )
  })

  it('merges zod-coerced output back over the raw values (number coercion)', () => {
    const fields = [field({ name: 'age', type: 'number' })]
    const result = resolveFormValues(fields, { age: '42' })
    expect(result.errors).toEqual({})
    expect((result.values as Record<string, unknown>).age).toBe(42)
  })

  it('excludes hidden fields so they never block submission', () => {
    const fields = [
      field({ name: 'country' }),
      field({
        id: 'state',
        name: 'state',
        required: true,
        visibleWhen: { field: 'country', operator: 'equals', value: 'US' },
      }),
    ]
    // country !== US -> state hidden -> its required rule is not applied
    expect(resolveFormValues(fields, { country: 'CA', state: '' }).errors).toEqual({})
    // country === US -> state visible -> required error surfaces
    const visible = resolveFormValues(fields, { country: 'US', state: '' })
    expect((visible.errors as Record<string, unknown>).state).toBeDefined()
  })
})

describe('mapZodErrors', () => {
  it('maps each failing field to a single RHF error', () => {
    const result = z.object({ a: z.string(), b: z.string() }).safeParse({ a: 1, b: 2 })
    expect(result.success).toBe(false)
    if (result.success) return
    const errors = mapZodErrors(result.error) as Record<string, { message: string }>
    expect(errors.a).toBeDefined()
    expect(errors.b).toBeDefined()
  })
})

describe('createFormResolver', () => {
  it('produces a resolver equivalent to resolveFormValues', () => {
    const fields = [field({ name: 'fullName', required: true })]
    const resolver = createFormResolver(fields)
    const values = { fullName: 'Ada' }
    // The RHF resolver signature passes (values, context, options); we only use values.
    expect(resolver(values, undefined, { fields: {}, shouldUseNativeValidation: false })).toEqual(
      resolveFormValues(fields, values),
    )
  })
})

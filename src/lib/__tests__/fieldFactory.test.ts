import { describe, it, expect } from 'vitest'
import {
  createDefaultField,
  reconcileFieldType,
  uniqueName,
  findDuplicateNames,
  hasDefaultLabel,
  hasDefaultName,
  cascadeFieldRename,
  clearVisibilityReferences,
} from '../fieldFactory'
import type { FormField } from '../types'

/** Minimal field with a visibleWhen condition for cascade tests. */
function fieldWatching(name: string, watches: string): FormField {
  return {
    id: name,
    type: 'text',
    name,
    label: name,
    visibleWhen: { field: watches, operator: 'equals', value: 'x' },
  }
}

describe('reconcileFieldType', () => {
  it('adds default options when switching into an option type', () => {
    const next = reconcileFieldType(createDefaultField('text'), 'select')
    expect(next.type).toBe('select')
    expect(next.options?.length).toBeGreaterThan(0)
  })

  it('drops options when switching out of an option type', () => {
    const next = reconcileFieldType(createDefaultField('select'), 'text')
    expect(next.options).toBeUndefined()
  })

  it('preserves existing options when staying within option types', () => {
    const select = { ...createDefaultField('select'), options: [{ label: 'A', value: 'a' }] }
    expect(reconcileFieldType(select, 'radio').options).toEqual([{ label: 'A', value: 'a' }])
  })

  it('resets the default value to a valid shape for the new type', () => {
    const text = { ...createDefaultField('text'), defaultValue: 'stale' }
    expect(reconcileFieldType(text, 'checkbox').defaultValue).toBe(false)
    expect(reconcileFieldType(text, 'number').defaultValue).toBeUndefined()
  })

  it('is a no-op when the type is unchanged', () => {
    const field = createDefaultField('text')
    expect(reconcileFieldType(field, 'text')).toBe(field)
  })
})

describe('name helpers', () => {
  it('uniqueName suffixes collisions', () => {
    expect(uniqueName('email', ['email'])).toBe('email_2')
    expect(uniqueName('email', ['email', 'email_2'])).toBe('email_3')
    expect(uniqueName('email', [])).toBe('email')
  })

  it('findDuplicateNames returns repeated names only', () => {
    expect(findDuplicateNames([{ name: 'a' }, { name: 'b' }, { name: 'a' }])).toEqual(['a'])
    expect(findDuplicateNames([{ name: 'a' }, { name: 'b' }])).toEqual([])
  })

  it('hasDefaultLabel/hasDefaultName recognize untouched auto-generated defaults', () => {
    const field = createDefaultField('text', ['field'])
    expect(hasDefaultLabel(field.label)).toBe(true)
    expect(hasDefaultName(field.name)).toBe(true) // "field_2"
    expect(hasDefaultName('field')).toBe(true)
    expect(hasDefaultLabel('Email')).toBe(false)
    expect(hasDefaultName('email')).toBe(false)
    expect(hasDefaultName('field_extra')).toBe(false)
  })
})

describe('visibility cascades', () => {
  it('cascadeFieldRename re-points dependents to the new name', () => {
    const fields = [fieldWatching('state', 'country'), fieldWatching('other', 'unrelated')]
    const result = cascadeFieldRename(fields, 'country', 'nation')
    expect(result[0].visibleWhen?.field).toBe('nation')
    expect(result[1].visibleWhen?.field).toBe('unrelated')
  })

  it('cascadeFieldRename leaves operator/value intact', () => {
    const [field] = cascadeFieldRename([fieldWatching('state', 'country')], 'country', 'nation')
    expect(field.visibleWhen).toEqual({ field: 'nation', operator: 'equals', value: 'x' })
  })

  it('clearVisibilityReferences drops conditions pointing at the removed field', () => {
    const fields = [fieldWatching('state', 'country'), fieldWatching('other', 'unrelated')]
    const result = clearVisibilityReferences(fields, 'country')
    expect(result[0].visibleWhen).toBeUndefined()
    expect(result[1].visibleWhen?.field).toBe('unrelated')
  })
})

import { describe, it, expect } from 'vitest'
import {
  createDefaultField,
  reconcileFieldType,
  uniqueName,
  findDuplicateNames,
} from './fieldFactory'

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
})

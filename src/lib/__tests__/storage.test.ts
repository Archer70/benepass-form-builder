import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { saveSchema, loadSchema } from '../storage'
import { createSchema } from '../types'

function mockStorage(overrides: Partial<Storage> = {}) {
  const map = new Map<string, string>()
  const base: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  }
  vi.stubGlobal('localStorage', { ...base, ...overrides })
}

describe('storage', () => {
  beforeEach(() => mockStorage())
  afterEach(() => vi.unstubAllGlobals())

  it('round-trips a saved schema (ok)', () => {
    const schema = createSchema('My form', [
      { id: 'a', type: 'text', name: 'first', label: 'First' },
    ])
    expect(saveSchema(schema)).toBe(true)

    const result = loadSchema()
    expect(result.status).toBe('ok')
    if (result.status === 'ok') expect(result.schema.title).toBe('My form')
  })

  it('reports empty when nothing is saved', () => {
    expect(loadSchema().status).toBe('empty')
  })

  it('reports invalid (distinct from empty) when the stored blob is corrupt', () => {
    localStorage.setItem('formbuilder.schema.v1', '{ not valid json')
    const result = loadSchema()
    expect(result.status).toBe('invalid')
  })

  it('returns false (no throw) when saving and storage is unavailable', () => {
    mockStorage({
      setItem: () => {
        throw new DOMException('QuotaExceededError')
      },
    })
    const schema = createSchema('x', [])
    expect(saveSchema(schema)).toBe(false)
  })
})

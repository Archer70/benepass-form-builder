import { describe, it, expect, beforeEach } from 'vitest'
import { useBuilderStore } from '../useBuilderStore'
import type { FormField } from '@/lib/types'

const store = () => useBuilderStore.getState()

const field = (over: Partial<FormField> & Pick<FormField, 'id' | 'name'>): FormField => ({
  type: 'text',
  label: over.name,
  ...over,
})

function seed(fields: FormField[]) {
  useBuilderStore.setState({ title: 'Test', fields, selectedId: fields[0]?.id ?? null })
}

describe('useBuilderStore', () => {
  beforeEach(() => store().reset())

  it('cascades a rename into dependent visibleWhen references', () => {
    seed([
      field({ id: 'a', name: 'country' }),
      field({
        id: 'b',
        name: 'state',
        visibleWhen: { field: 'country', operator: 'equals', value: 'US' },
      }),
    ])

    store().updateField('a', { name: 'nation' })

    const dependent = store().fields.find((f) => f.id === 'b')
    expect(dependent?.visibleWhen?.field).toBe('nation')
  })

  it('clears dangling visibleWhen references when the controlling field is removed', () => {
    seed([
      field({ id: 'a', name: 'country' }),
      field({
        id: 'b',
        name: 'state',
        visibleWhen: { field: 'country', operator: 'equals', value: 'US' },
      }),
    ])

    store().removeField('a')

    const fields = store().fields
    expect(fields).toHaveLength(1)
    expect(fields[0].id).toBe('b')
    expect(fields[0].visibleWhen).toBeUndefined()
  })

  it('selects the first remaining field when the selected one is removed', () => {
    seed([field({ id: 'a', name: 'a' }), field({ id: 'b', name: 'b' })])
    useBuilderStore.setState({ selectedId: 'a' })

    store().removeField('a')

    expect(store().selectedId).toBe('b')
  })
})

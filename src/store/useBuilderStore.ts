import { create } from 'zustand'
import { arrayMove } from '@dnd-kit/sortable'
import type { FieldType, FormField, FormSchema } from '@/lib/types'
import { createSchema } from '@/lib/types'
import { createDefaultField } from '@/lib/fieldFactory'

const DEFAULT_TITLE = 'Untitled form'

interface BuilderState {
  title: string
  fields: FormField[]
  selectedId: string | null

  // selectors
  getSchema: () => FormSchema

  // actions
  setTitle: (title: string) => void
  addField: (type: FieldType) => void
  removeField: (id: string) => void
  updateField: (id: string, patch: Partial<FormField>) => void
  moveField: (activeId: string, overId: string) => void
  selectField: (id: string | null) => void
  hydrate: (schema: FormSchema) => void
  reset: () => void
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  title: DEFAULT_TITLE,
  fields: [],
  selectedId: null,

  getSchema: () => createSchema(get().title, get().fields),

  setTitle: (title) => set({ title }),

  addField: (type) =>
    set((state) => {
      const field = createDefaultField(
        type,
        state.fields.map((f) => f.name),
      )
      return { fields: [...state.fields, field], selectedId: field.id }
    }),

  removeField: (id) =>
    set((state) => {
      const fields = state.fields.filter((f) => f.id !== id)
      const selectedId =
        state.selectedId === id ? (fields[0]?.id ?? null) : state.selectedId
      return { fields, selectedId }
    }),

  updateField: (id, patch) =>
    set((state) => {
      const target = state.fields.find((f) => f.id === id)
      // When a field is renamed, keep any visibleWhen references pointing at it.
      const rename =
        target && typeof patch.name === 'string' && patch.name !== target.name && target.name
          ? { from: target.name, to: patch.name }
          : null

      return {
        fields: state.fields.map((f) => {
          const updated = f.id === id ? { ...f, ...patch } : f
          if (rename && updated.visibleWhen?.field === rename.from) {
            return { ...updated, visibleWhen: { ...updated.visibleWhen, field: rename.to } }
          }
          return updated
        }),
      }
    }),

  moveField: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.fields.findIndex((f) => f.id === activeId)
      const newIndex = state.fields.findIndex((f) => f.id === overId)
      if (oldIndex === -1 || newIndex === -1) return state
      return { fields: arrayMove(state.fields, oldIndex, newIndex) }
    }),

  selectField: (id) => set({ selectedId: id }),

  hydrate: (schema) =>
    set({
      title: schema.title,
      fields: schema.fields,
      selectedId: schema.fields[0]?.id ?? null,
    }),

  reset: () => set({ title: DEFAULT_TITLE, fields: [], selectedId: null }),
}))

/** The currently selected field, or undefined when nothing is selected. */
export const useSelectedField = (): FormField | undefined =>
  useBuilderStore((s) => s.fields.find((f) => f.id === s.selectedId))

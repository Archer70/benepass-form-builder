import type { FormSchema } from './types'
import { parseFormSchema } from './metaSchema'

const STORAGE_KEY = 'formbuilder.schema.v1'

/** Persist the schema to localStorage (Save button). */
export function saveSchema(schema: FormSchema): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schema))
}

/** Read + validate a previously saved schema (Load button). */
export function loadSchema(): FormSchema | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  const result = parseFormSchema(raw)
  return result.success ? (result.data ?? null) : null
}

/** Remove the saved schema (Reset button). */
export function clearSchema(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/** Whether a saved schema currently exists. */
export function hasSavedSchema(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}

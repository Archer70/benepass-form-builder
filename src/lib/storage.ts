import type { FormSchema } from './types'
import { parseFormSchema } from './metaSchema'

const STORAGE_KEY = 'formbuilder.schema.v1'

/** Result of attempting to load a saved schema. */
export type LoadResult =
  | { status: 'ok'; schema: FormSchema }
  | { status: 'empty' }
  | { status: 'invalid'; error: string }

/**
 * Persist the schema to localStorage (Save button). Returns false when storage
 * is unavailable — quota exceeded, Safari private mode, or access denied — so
 * the caller can surface a failure instead of throwing.
 */
export function saveSchema(schema: FormSchema): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schema))
    return true
  } catch {
    return false
  }
}

/**
 * Read + validate a previously saved schema (Load button), distinguishing
 * "nothing saved" from "saved but no longer valid" (corrupted, or an
 * incompatible older format) so the two can be reported differently.
 */
export function loadSchema(): LoadResult {
  let raw: string | null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return { status: 'invalid', error: 'Browser storage is unavailable.' }
  }
  if (!raw) return { status: 'empty' }

  const result = parseFormSchema(raw)
  if (result.success && result.data) return { status: 'ok', schema: result.data }
  return { status: 'invalid', error: result.error ?? 'Saved form is no longer valid.' }
}

/** Remove the saved schema (Reset button). */
export function clearSchema(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

/** Whether a saved schema currently exists. */
export function hasSavedSchema(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

import { nanoid } from 'nanoid'
import type { FieldType, FormField } from './types'
import { FIELD_TYPE_LABELS, OPTION_FIELD_TYPES } from './types'

/** Generate a name that is unique among `existing` names, based on `base`. */
export function uniqueName(base: string, existing: string[]): string {
  const taken = new Set(existing)
  if (!taken.has(base)) return base
  let i = 2
  while (taken.has(`${base}_${i}`)) i++
  return `${base}_${i}`
}

/** Convert a label into a safe field name (snake_case, alphanumeric). */
export function slugifyName(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return slug || 'field'
}

/**
 * Build a sensible default field for a given type, with a name unique among
 * the names already in use.
 */
export function createDefaultField(type: FieldType, existingNames: string[] = []): FormField {
  const baseName = uniqueName(type, existingNames)
  const label = FIELD_TYPE_LABELS[type]

  const field: FormField = {
    id: nanoid(),
    type,
    name: baseName,
    label,
    placeholder: '',
    helpText: '',
    required: false,
    validation: { required: false },
  }

  if (OPTION_FIELD_TYPES.includes(type)) {
    field.options = [
      { label: 'Option 1', value: 'option_1' },
      { label: 'Option 2', value: 'option_2' },
    ]
  }

  if (type === 'checkbox') {
    field.defaultValue = false
  }

  return field
}

import { nanoid } from 'nanoid'
import type { FieldOption, FieldType, FormField } from './types'
import { FIELD_CAPABILITIES } from './types'

// Type-neutral defaults: a new field almost always gets its type changed right
// after creation, so seeding the label/name from the initial `text` type ("Text",
// "text_3") would leave a stale, misleading name once it becomes a radio/date/etc.
export const DEFAULT_FIELD_LABEL = 'Untitled field'
const DEFAULT_FIELD_NAME = 'field'
const DEFAULT_NAME_PATTERN = new RegExp(`^${DEFAULT_FIELD_NAME}(_\\d+)?$`)

/** True while the label is still the untouched auto-generated default. */
export function hasDefaultLabel(label: string): boolean {
  return label === DEFAULT_FIELD_LABEL
}

/** True while the name is still an untouched auto-generated default (field, field_2, …). */
export function hasDefaultName(name: string): boolean {
  return DEFAULT_NAME_PATTERN.test(name)
}

/** Two starter options for option-based fields (select/radio). */
function defaultOptions(): FieldOption[] {
  return [
    { label: 'Option 1', value: 'option_1' },
    { label: 'Option 2', value: 'option_2' },
  ]
}

/** Generate a name that is unique among `existing` names, based on `base`. */
export function uniqueName(base: string, existing: string[]): string {
  const taken = new Set(existing)
  if (!taken.has(base)) return base
  let i = 2
  while (taken.has(`${base}_${i}`)) i++
  return `${base}_${i}`
}

/** Return the set of field names that appear more than once. */
export function findDuplicateNames(fields: { name: string }[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const { name } of fields) {
    if (seen.has(name)) duplicates.add(name)
    seen.add(name)
  }
  return [...duplicates]
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
  const baseName = uniqueName(DEFAULT_FIELD_NAME, existingNames)
  const label = DEFAULT_FIELD_LABEL

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

  if (FIELD_CAPABILITIES[type].hasOptions) {
    field.options = defaultOptions()
  }

  if (type === 'checkbox') {
    field.defaultValue = false
  }

  return field
}

/**
 * Change a field's type, reconciling type-specific props so the result stays
 * coherent: option fields gain default options (if none), non-option fields
 * drop them, and the default value resets to a valid shape for the new type.
 */
export function reconcileFieldType(field: FormField, nextType: FieldType): FormField {
  if (field.type === nextType) return field
  const next: FormField = { ...field, type: nextType }

  if (FIELD_CAPABILITIES[nextType].hasOptions) {
    next.options = field.options?.length ? field.options : defaultOptions()
  } else {
    delete next.options
  }

  next.defaultValue = nextType === 'checkbox' ? false : undefined
  return next
}

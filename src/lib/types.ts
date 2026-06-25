/**
 * Core data model for the form builder.
 *
 * A `FormSchema` is the single source of truth: the builder edits it, the
 * renderer consumes it, and export/import simply (de)serialize it to JSON.
 */

export const FIELD_TYPES = [
  'text',
  'textarea',
  'number',
  'select',
  'radio',
  'checkbox',
  'date',
] as const

export type FieldType = (typeof FIELD_TYPES)[number]

export interface FieldOption {
  label: string
  value: string
}

export interface ValidationRules {
  /** Field must have a value. Also surfaced as `FormField.required` for convenience. */
  required?: boolean
  /** Minimum string length / array length, or minimum numeric value. */
  min?: number
  /** Maximum string length / array length, or maximum numeric value. */
  max?: number
  /** Regular expression the value must match (string fields only). */
  regex?: { pattern: string; message?: string }
  /**
   * Custom rule evaluated by a small, safe predicate DSL (no `eval`).
   * See `lib/customRule.ts` for the supported grammar.
   */
  custom?: { expression: string; message?: string }
}

export type VisibilityOperator = 'equals' | 'notEquals' | 'in' | 'truthy'

export interface VisibilityCondition {
  /** `name` of the controlling field. */
  field: string
  operator: VisibilityOperator
  /** Comparison value(s). Unused for `truthy`. */
  value?: string | string[]
}

export interface FormField {
  /** Stable internal id (nanoid) used for selection and drag-and-drop. */
  id: string
  type: FieldType
  /** Form key — must be unique within the schema. */
  name: string
  label: string
  placeholder?: string
  helpText?: string
  required?: boolean
  defaultValue?: unknown
  /** Choices for `select` / `radio`. */
  options?: FieldOption[]
  validation?: ValidationRules
  /** When set, the field only renders/validates if the condition is met. */
  visibleWhen?: VisibilityCondition
}

/** Current schema format version. Bump when the shape changes. */
export const SCHEMA_VERSION = 1

export interface FormSchema {
  version: typeof SCHEMA_VERSION
  title: string
  fields: FormField[]
}

/** Build a `FormSchema` from a title + fields, stamping the current version. */
export function createSchema(title: string, fields: FormField[]): FormSchema {
  return { version: SCHEMA_VERSION, title, fields }
}

export interface FieldCapabilities {
  /** Field stores its value as one of a fixed set of options (select/radio). */
  hasOptions: boolean
  /** A free-text placeholder is meaningful for this field. */
  hasPlaceholder: boolean
}

/** Single source of truth for per-type capabilities used across lib + UI. */
export const FIELD_CAPABILITIES: Record<FieldType, FieldCapabilities> = {
  text: { hasOptions: false, hasPlaceholder: true },
  textarea: { hasOptions: false, hasPlaceholder: true },
  number: { hasOptions: false, hasPlaceholder: true },
  select: { hasOptions: true, hasPlaceholder: true },
  radio: { hasOptions: true, hasPlaceholder: false },
  checkbox: { hasOptions: false, hasPlaceholder: false },
  date: { hasOptions: false, hasPlaceholder: true },
}

/** Field types that store their value as one of a fixed set of options. */
export const OPTION_FIELD_TYPES: FieldType[] = FIELD_TYPES.filter(
  (t) => FIELD_CAPABILITIES[t].hasOptions,
)

/** Human-readable labels for each field type, used across the builder UI. */
export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Text',
  textarea: 'Text area',
  number: 'Number',
  select: 'Select',
  radio: 'Radio group',
  checkbox: 'Checkbox',
  date: 'Date',
}

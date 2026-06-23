import type { FormField, VisibilityCondition } from './types'

/** Evaluate a single visibility condition against the current form values. */
export function evaluateCondition(
  condition: VisibilityCondition,
  values: Record<string, unknown>,
): boolean {
  const actual = values[condition.field]
  switch (condition.operator) {
    case 'equals':
      return String(actual ?? '') === String(condition.value ?? '')
    case 'notEquals':
      return String(actual ?? '') !== String(condition.value ?? '')
    case 'in': {
      const list = Array.isArray(condition.value) ? condition.value : [condition.value ?? '']
      return list.map(String).includes(String(actual ?? ''))
    }
    case 'truthy':
      return Boolean(actual)
    default:
      return true
  }
}

/** A field with no `visibleWhen` is always visible. */
export function isFieldVisible(field: FormField, values: Record<string, unknown>): boolean {
  if (!field.visibleWhen) return true
  return evaluateCondition(field.visibleWhen, values)
}

/** Return only the fields that are currently visible given the form values. */
export function visibleFields(
  fields: FormField[],
  values: Record<string, unknown>,
): FormField[] {
  return fields.filter((field) => isFieldVisible(field, values))
}

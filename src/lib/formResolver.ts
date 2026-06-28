import type { FieldError, FieldErrors, Resolver, ResolverResult } from 'react-hook-form'
import type { ZodError } from 'zod'
import type { FormField } from './types'
import { buildZodSchema } from './buildZodSchema'

type Values = Record<string, unknown>

/**
 * Map a ZodError into react-hook-form's error shape, keeping only the first
 * issue per field (RHF shows one message per input).
 */
export function mapZodErrors(error: ZodError): FieldErrors<Values> {
  const errors: Record<string, FieldError> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '')
    if (key && !errors[key]) {
      errors[key] = { type: String(issue.code ?? 'validation'), message: issue.message }
    }
  }
  return errors as FieldErrors<Values>
}

/**
 * Validate `values` against the visibility-aware schema derived from `fields`.
 *
 * `buildZodSchema` re-derives the active schema from the *current* values, so
 * hidden (conditionally invisible) fields are excluded and never block
 * submission. On success we merge zod's parsed/coerced output (e.g. number
 * coercion) back over the raw values.
 */
export function resolveFormValues(fields: FormField[], values: Values): ResolverResult<Values> {
  const parsed = buildZodSchema(fields, values).safeParse(values)
  if (parsed.success) {
    return { values: { ...values, ...parsed.data }, errors: {} }
  }
  return { values: {}, errors: mapZodErrors(parsed.error) }
}

/** Build a react-hook-form resolver bound to a set of fields. */
export function createFormResolver(fields: FormField[]): Resolver<Values> {
  return (values) => resolveFormValues(fields, values)
}

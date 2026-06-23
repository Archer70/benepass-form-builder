import { z } from 'zod'
import type { FormField } from './types'
import { isFieldVisible } from './visibility'
import { evaluateCustomRule } from './customRule'

/** A value is "empty" if the user has not meaningfully filled it in. */
function isEmpty(v: unknown): boolean {
  return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)
}

/** Attach a custom-rule refinement, skipping evaluation for empty values. */
function withCustomRule(schema: z.ZodTypeAny, field: FormField): z.ZodTypeAny {
  const custom = field.validation?.custom
  if (!custom?.expression?.trim()) return schema
  return schema.refine(
    (v: unknown) => {
      if (isEmpty(v)) return true
      try {
        return evaluateCustomRule(custom.expression, v)
      } catch {
        // A malformed expression should never block the user.
        return true
      }
    },
    { message: custom.message || 'Invalid value' },
  )
}

/** Schema describing a *present* (non-empty) value for the given field. */
function buildPresentSchema(field: FormField): z.ZodTypeAny {
  const v = field.validation ?? {}

  switch (field.type) {
    case 'text':
    case 'textarea': {
      let s = z.string()
      if (typeof v.min === 'number') s = s.min(v.min, `Must be at least ${v.min} characters`)
      if (typeof v.max === 'number') s = s.max(v.max, `Must be at most ${v.max} characters`)
      if (v.regex?.pattern) {
        try {
          const re = new RegExp(v.regex.pattern)
          s = s.regex(re, v.regex.message || 'Invalid format')
        } catch {
          // Ignore invalid regex patterns rather than crashing the renderer.
        }
      }
      return withCustomRule(s, field)
    }

    case 'select':
    case 'radio':
    case 'date': {
      return withCustomRule(z.string(), field)
    }

    case 'number': {
      let n = z.number()
      if (typeof v.min === 'number') n = n.min(v.min, `Must be at least ${v.min}`)
      if (typeof v.max === 'number') n = n.max(v.max, `Must be at most ${v.max}`)
      return withCustomRule(n, field)
    }

    case 'checkbox': {
      return withCustomRule(z.boolean(), field)
    }

    default:
      return z.unknown()
  }
}

/** Normalize raw input into either `undefined` (empty) or a typed value. */
function makePreprocessor(field: FormField) {
  if (field.type === 'number') {
    return (val: unknown) => {
      if (val === '' || val === null || val === undefined) return undefined
      const n = typeof val === 'number' ? val : Number(val)
      // Keep non-numeric input as-is so z.number() reports a type error.
      return Number.isNaN(n) ? val : n
    }
  }
  if (field.type === 'checkbox') {
    // `false` is a real value — never coerce it to "empty".
    return (val: unknown) => val
  }
  return (val: unknown) => (val === '' || val === null ? undefined : val)
}

/** Build the zod schema for a single field, handling optional/required. */
function buildFieldSchema(field: FormField): z.ZodTypeAny {
  const present = buildPresentSchema(field)
  const required = Boolean(field.required || field.validation?.required)
  const schema = z.preprocess(makePreprocessor(field), present.optional())

  if (!required) return schema

  const requiredMessage =
    field.type === 'checkbox'
      ? 'This must be checked'
      : `${field.label || field.name} is required`

  return schema.refine(
    (v: unknown) => (field.type === 'checkbox' ? v === true : !isEmpty(v)),
    { message: requiredMessage },
  )
}

/**
 * Build a zod object schema for the currently *visible* fields.
 *
 * Hidden fields (failing their visibility condition) are excluded entirely so
 * they neither block submission nor appear in the validated output.
 */
export function buildZodSchema(
  fields: FormField[],
  values: Record<string, unknown> = {},
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const field of fields) {
    if (!isFieldVisible(field, values)) continue
    shape[field.name] = buildFieldSchema(field)
  }
  return z.object(shape)
}

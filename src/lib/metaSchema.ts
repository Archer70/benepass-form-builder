import { z } from 'zod'
import type { FormSchema } from './types'
import { FIELD_TYPES, OPTION_FIELD_TYPES, SCHEMA_VERSION } from './types'
import { findDuplicateNames } from './fieldFactory'
import { compileRegex } from './buildZodSchema'
import { validateCustomExpression } from './customRule'

/**
 * A zod "schema of the schema": validates that imported JSON is a well-formed
 * `FormSchema` before we hydrate the builder with it.
 *
 * Object schemas are `.strict()` so a hand-edited import with a misspelled key
 * (e.g. `requied`, `validaton`) surfaces as an error rather than silently
 * dropping the rule on round-trip.
 */

const fieldOptionSchema = z
  .object({
    label: z.string(),
    value: z.string(),
  })
  .strict()

const validationRulesSchema = z
  .object({
    min: z.number().optional(),
    max: z.number().optional(),
    regex: z
      .object({
        pattern: z.string(),
        message: z.string().optional(),
      })
      .strict()
      .optional(),
    custom: z
      .object({
        expression: z.string(),
        message: z.string().optional(),
      })
      .strict()
      .optional(),
  })
  .strict()

const visibilityConditionSchema = z
  .object({
    field: z.string(),
    operator: z.enum(['equals', 'notEquals', 'in', 'truthy']),
    value: z.union([z.string(), z.array(z.string())]).optional(),
  })
  .strict()

const formFieldSchema = z
  .object({
    id: z.string(),
    type: z.enum(FIELD_TYPES),
    name: z.string().min(1, 'Field name is required'),
    label: z.string(),
    placeholder: z.string().optional(),
    helpText: z.string().optional(),
    required: z.boolean().optional(),
    defaultValue: z.unknown().optional(),
    options: z.array(fieldOptionSchema).optional(),
    validation: validationRulesSchema.optional(),
    visibleWhen: visibilityConditionSchema.optional(),
  })
  .strict()

export const formSchemaMeta = z
  .object({
    version: z.literal(SCHEMA_VERSION),
    title: z.string(),
    fields: z.array(formFieldSchema),
  })
  .superRefine((schema, ctx) => {
    const duplicateNames = findDuplicateNames(schema.fields)
    if (duplicateNames.length > 0) {
      ctx.addIssue({
        code: 'custom',
        message: `Duplicate field name(s): ${duplicateNames.join(', ')}`,
        path: ['fields'],
      })
    }

    const ids = schema.fields.map((f) => f.id)
    const duplicateIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))]
    if (duplicateIds.length > 0) {
      ctx.addIssue({
        code: 'custom',
        message: `Duplicate field id(s): ${duplicateIds.join(', ')}`,
        path: ['fields'],
      })
    }

    const knownNames = new Set(schema.fields.map((f) => f.name))
    schema.fields.forEach((field, i) => {
      if (OPTION_FIELD_TYPES.includes(field.type) && !field.options?.length) {
        ctx.addIssue({
          code: 'custom',
          message: `Field "${field.name}" (${field.type}) needs at least one option`,
          path: ['fields', i, 'options'],
        })
      }

      // A regex that won't compile would silently disable validation at runtime.
      const pattern = field.validation?.regex?.pattern
      if (pattern && !compileRegex(pattern)) {
        ctx.addIssue({
          code: 'custom',
          message: `Field "${field.name}" has an invalid regex pattern`,
          path: ['fields', i, 'validation', 'regex', 'pattern'],
        })
      }

      // An unparseable custom rule would also be silently skipped at runtime.
      const expression = field.validation?.custom?.expression
      const customError = expression ? validateCustomExpression(expression) : null
      if (customError) {
        ctx.addIssue({
          code: 'custom',
          message: `Field "${field.name}" has an invalid custom rule: ${customError}`,
          path: ['fields', i, 'validation', 'custom', 'expression'],
        })
      }

      const condition = field.visibleWhen
      if (condition) {
        if (!knownNames.has(condition.field)) {
          ctx.addIssue({
            code: 'custom',
            message: `Field "${field.name}" has a visibility condition referencing unknown field "${condition.field}"`,
            path: ['fields', i, 'visibleWhen', 'field'],
          })
        }
        // Correlate value shape with operator: `in` takes a list, equality a scalar.
        if (condition.operator === 'in' && !Array.isArray(condition.value)) {
          ctx.addIssue({
            code: 'custom',
            message: `Field "${field.name}": the "is one of" condition needs a list of values`,
            path: ['fields', i, 'visibleWhen', 'value'],
          })
        }
        if (
          (condition.operator === 'equals' || condition.operator === 'notEquals') &&
          Array.isArray(condition.value)
        ) {
          ctx.addIssue({
            code: 'custom',
            message: `Field "${field.name}": the "${condition.operator}" condition needs a single value, not a list`,
            path: ['fields', i, 'visibleWhen', 'value'],
          })
        }
      }
    })
  })

export interface ParseResult {
  success: boolean
  data?: FormSchema
  error?: string
}

/** Parse + validate a raw JSON string into a `FormSchema`. */
export function parseFormSchema(json: string): ParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (err) {
    return { success: false, error: `Invalid JSON: ${(err as Error).message}` }
  }

  const result = formSchemaMeta.safeParse(parsed)
  if (!result.success) {
    const first = result.error.issues[0]
    const path = first.path.length ? `${first.path.join('.')}: ` : ''
    return { success: false, error: `${path}${first.message}` }
  }

  return { success: true, data: result.data as FormSchema }
}

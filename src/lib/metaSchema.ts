import { z } from 'zod'
import type { FormSchema } from './types'
import { FIELD_TYPES, OPTION_FIELD_TYPES, SCHEMA_VERSION } from './types'
import { findDuplicateNames } from './fieldFactory'

/**
 * A zod "schema of the schema": validates that imported JSON is a well-formed
 * `FormSchema` before we hydrate the builder with it.
 */

const fieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
})

const validationRulesSchema = z.object({
  required: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  regex: z
    .object({
      pattern: z.string(),
      message: z.string().optional(),
    })
    .optional(),
  custom: z
    .object({
      expression: z.string(),
      message: z.string().optional(),
    })
    .optional(),
})

const visibilityConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['equals', 'notEquals', 'in', 'truthy']),
  value: z.union([z.string(), z.array(z.string())]).optional(),
})

const formFieldSchema = z.object({
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
      if (field.visibleWhen && !knownNames.has(field.visibleWhen.field)) {
        ctx.addIssue({
          code: 'custom',
          message: `Field "${field.name}" has a visibility condition referencing unknown field "${field.visibleWhen.field}"`,
          path: ['fields', i, 'visibleWhen', 'field'],
        })
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

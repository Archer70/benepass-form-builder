import { z } from 'zod'
import type { FormSchema } from './types'
import { FIELD_TYPES } from './types'

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
    version: z.literal(1),
    title: z.string(),
    fields: z.array(formFieldSchema),
  })
  .superRefine((schema, ctx) => {
    const names = schema.fields.map((f) => f.name)
    const duplicates = names.filter((name, i) => names.indexOf(name) !== i)
    if (duplicates.length > 0) {
      ctx.addIssue({
        code: 'custom',
        message: `Duplicate field name(s): ${[...new Set(duplicates)].join(', ')}`,
        path: ['fields'],
      })
    }
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

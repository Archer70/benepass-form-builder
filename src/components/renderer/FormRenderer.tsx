import { useMemo, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { Loader2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldRenderer } from './FieldRenderer'
import { SubmitStatus } from './SubmitStatus'
import type { FormSchema } from '@/lib/types'
import { buildZodSchema } from '@/lib/buildZodSchema'
import { visibleFields } from '@/lib/visibility'
import { mockSubmit, type SubmitResult } from '@/lib/mockSubmit'

type Values = Record<string, unknown>

/** Build initial form values from each field's configured default. */
function buildDefaults(schema: FormSchema): Values {
  const out: Values = {}
  for (const field of schema.fields) {
    if (field.type === 'checkbox') {
      out[field.name] = field.defaultValue === true
    } else {
      out[field.name] =
        field.defaultValue === undefined || field.defaultValue === null
          ? ''
          : String(field.defaultValue)
    }
  }
  return out
}

export function FormRenderer({ schema }: { schema: FormSchema }) {
  const defaultValues = useMemo(() => buildDefaults(schema), [schema])
  const [result, setResult] = useState<SubmitResult | null>(null)

  // A visibility-aware resolver: validation re-derives the active schema from
  // the *current* values, so hidden fields never block submission.
  const resolver = useMemo<Resolver<Values>>(
    () => (values) => {
      const zodSchema = buildZodSchema(schema.fields, values)
      const parsed = zodSchema.safeParse(values)
      if (parsed.success) {
        return { values: { ...values, ...parsed.data }, errors: {} }
      }
      const errors: Record<string, { type: string; message: string }> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? '')
        if (key && !errors[key]) {
          errors[key] = { type: String(issue.code ?? 'validation'), message: issue.message }
        }
      }
      return { values: {}, errors: errors as never }
    },
    [schema.fields],
  )

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues, resolver, mode: 'onTouched' })

  const values = watch()
  const visible = visibleFields(schema.fields, values)

  async function onSubmit(data: Values) {
    setResult(null)
    // Submit only currently-visible fields so stale values from hidden
    // (conditional) fields don't leak into the payload.
    const visibleNames = new Set(visibleFields(schema.fields, data).map((f) => f.name))
    const payload = Object.fromEntries(
      Object.entries(data).filter(([key]) => visibleNames.has(key)),
    )
    const res = await mockSubmit(payload)
    setResult(res)
  }

  if (schema.fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        <FileText className="size-8" />
        <p className="text-sm">This form has no fields yet.</p>
        <p className="text-xs">Switch to the Build tab to add some.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {visible.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          control={control}
          error={errors[field.name]?.message as string | undefined}
        />
      ))}

      <SubmitStatus result={result} />

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </Button>
        {isSubmitting && (
          <span className="text-xs text-muted-foreground">Simulating a 1s server round-trip…</span>
        )}
      </div>
    </form>
  )
}

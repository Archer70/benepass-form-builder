import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { FormField, ValidationRules } from '@/lib/types'
import { validateCustomExpression } from '@/lib/customRule'

interface Props {
  field: FormField
  onUpdate: (patch: Partial<FormField>) => void
}

export function ValidationEditor({ field, onUpdate }: Props) {
  const v = field.validation ?? {}
  const isText = field.type === 'text' || field.type === 'textarea'
  const isNumber = field.type === 'number'
  const supportsMinMax = isText || isNumber
  const supportsRegex = isText
  const supportsCustom = isText || isNumber

  function patchValidation(patch: Partial<ValidationRules>) {
    onUpdate({ validation: { ...v, ...patch } })
  }

  function numOrUndef(raw: string): number | undefined {
    if (raw.trim() === '') return undefined
    const n = Number(raw)
    return Number.isNaN(n) ? undefined : n
  }

  const customError = validateCustomExpression(v.custom?.expression ?? '')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={`required-${field.id}`}>Required</Label>
        <Switch
          id={`required-${field.id}`}
          checked={Boolean(field.required || v.required)}
          onCheckedChange={(checked) =>
            onUpdate({ required: checked, validation: { ...v, required: checked } })
          }
        />
      </div>

      {supportsMinMax && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor={`min-${field.id}`}>{isNumber ? 'Min value' : 'Min length'}</Label>
            <Input
              id={`min-${field.id}`}
              type="number"
              value={v.min ?? ''}
              onChange={(e) => patchValidation({ min: numOrUndef(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`max-${field.id}`}>{isNumber ? 'Max value' : 'Max length'}</Label>
            <Input
              id={`max-${field.id}`}
              type="number"
              value={v.max ?? ''}
              onChange={(e) => patchValidation({ max: numOrUndef(e.target.value) })}
            />
          </div>
        </div>
      )}

      {supportsRegex && (
        <div className="space-y-2">
          <div className="space-y-1.5">
            <Label htmlFor={`regex-${field.id}`}>Regex pattern</Label>
            <Input
              id={`regex-${field.id}`}
              className="font-mono text-xs"
              placeholder="^[a-z]+$"
              value={v.regex?.pattern ?? ''}
              onChange={(e) => {
                const pattern = e.target.value
                patchValidation({
                  regex: pattern ? { pattern, message: v.regex?.message } : undefined,
                })
              }}
            />
          </div>
          {v.regex?.pattern && (
            <div className="space-y-1.5">
              <Label htmlFor={`regex-msg-${field.id}`}>Regex error message</Label>
              <Input
                id={`regex-msg-${field.id}`}
                placeholder="Invalid format"
                value={v.regex?.message ?? ''}
                onChange={(e) =>
                  patchValidation({
                    regex: { pattern: v.regex!.pattern, message: e.target.value || undefined },
                  })
                }
              />
            </div>
          )}
        </div>
      )}

      {supportsCustom && (
        <div className="space-y-2">
          <div className="space-y-1.5">
            <Label htmlFor={`custom-${field.id}`}>Custom rule</Label>
            <Input
              id={`custom-${field.id}`}
              className="font-mono text-xs"
              placeholder='value !== "forbidden"'
              value={v.custom?.expression ?? ''}
              onChange={(e) => {
                const expression = e.target.value
                patchValidation({
                  custom: expression
                    ? { expression, message: v.custom?.message }
                    : undefined,
                })
              }}
            />
            <p className="text-[11px] text-muted-foreground">
              Use <code className="font-mono">value</code> and{' '}
              <code className="font-mono">value.length</code>, e.g.{' '}
              <code className="font-mono">value.length &gt;= 3 &amp;&amp; value !== "admin"</code>
            </p>
            {customError && <p className="text-[11px] text-destructive">{customError}</p>}
          </div>
          {v.custom?.expression && (
            <div className="space-y-1.5">
              <Label htmlFor={`custom-msg-${field.id}`}>Custom error message</Label>
              <Input
                id={`custom-msg-${field.id}`}
                placeholder="Invalid value"
                value={v.custom?.message ?? ''}
                onChange={(e) =>
                  patchValidation({
                    custom: { expression: v.custom!.expression, message: e.target.value || undefined },
                  })
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { FieldRow } from './FieldRow'
import type { FormField, ValidationRules } from '@/lib/types'
import { validateCustomExpression } from '@/lib/customRule'
import { compileRegex } from '@/lib/buildZodSchema'
import { parseNumberInput } from '@/lib/utils'

const CUSTOM_RULE_HINT = (
  <>
    Use <code className="font-mono">value</code> and{' '}
    <code className="font-mono">value.length</code>, e.g.{' '}
    <code className="font-mono">value.length &gt;= 3 &amp;&amp; value !== "admin"</code>
  </>
)

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

  const customError = validateCustomExpression(v.custom?.expression ?? '')
  const regexError =
    v.regex?.pattern && !compileRegex(v.regex.pattern) ? 'Invalid regular expression' : null

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
          <FieldRow label={isNumber ? 'Min value' : 'Min length'} htmlFor={`min-${field.id}`}>
            <Input
              id={`min-${field.id}`}
              type="number"
              value={v.min ?? ''}
              onChange={(e) => patchValidation({ min: parseNumberInput(e.target.value) })}
            />
          </FieldRow>
          <FieldRow label={isNumber ? 'Max value' : 'Max length'} htmlFor={`max-${field.id}`}>
            <Input
              id={`max-${field.id}`}
              type="number"
              value={v.max ?? ''}
              onChange={(e) => patchValidation({ max: parseNumberInput(e.target.value) })}
            />
          </FieldRow>
        </div>
      )}

      {supportsRegex && (
        <div className="space-y-2">
          <FieldRow label="Regex pattern" htmlFor={`regex-${field.id}`} error={regexError}>
            <Input
              id={`regex-${field.id}`}
              className="font-mono text-xs placeholder:text-muted-foreground/50"
              placeholder="^[a-z]+$"
              value={v.regex?.pattern ?? ''}
              onChange={(e) => {
                const pattern = e.target.value
                patchValidation({
                  regex: pattern ? { pattern, message: v.regex?.message } : undefined,
                })
              }}
            />
          </FieldRow>
          {v.regex?.pattern && (
            <FieldRow label="Regex error message" htmlFor={`regex-msg-${field.id}`}>
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
            </FieldRow>
          )}
        </div>
      )}

      {supportsCustom && (
        <div className="space-y-2">
          <FieldRow
            label="Custom rule"
            htmlFor={`custom-${field.id}`}
            hint={CUSTOM_RULE_HINT}
            error={customError}
          >
            <Input
              id={`custom-${field.id}`}
              className="font-mono text-xs placeholder:text-muted-foreground/50"
              placeholder='value !== "forbidden"'
              value={v.custom?.expression ?? ''}
              onChange={(e) => {
                const expression = e.target.value
                patchValidation({
                  custom: expression ? { expression, message: v.custom?.message } : undefined,
                })
              }}
            />
          </FieldRow>
          {v.custom?.expression && (
            <FieldRow label="Custom error message" htmlFor={`custom-msg-${field.id}`}>
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
            </FieldRow>
          )}
        </div>
      )}
    </div>
  )
}

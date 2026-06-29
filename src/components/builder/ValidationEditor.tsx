import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldRow } from './FieldRow'
import type { FormField, ValidationRules } from '@/lib/types'
import { compileRegex } from '@/lib/regex'
import {
  CUSTOM_VALIDATORS,
  CUSTOM_VALIDATOR_KINDS,
  type CustomValidatorKind,
} from '@/lib/customValidators'
import { parseNumberInput } from '@/lib/utils'

const NO_CUSTOM = '__none__'

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
  const supportsCustom = isText

  function patchValidation(patch: Partial<ValidationRules>) {
    onUpdate({ validation: { ...v, ...patch } })
  }

  const regexError =
    v.regex?.pattern && !compileRegex(v.regex.pattern) ? 'Invalid regular expression' : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={`required-${field.id}`}>Required</Label>
        <Switch
          id={`required-${field.id}`}
          checked={Boolean(field.required)}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
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
          <FieldRow label="Custom rule" htmlFor={`custom-${field.id}`}>
            <Select
              value={v.custom?.kind ?? NO_CUSTOM}
              onValueChange={(value) =>
                patchValidation({
                  custom:
                    value === NO_CUSTOM
                      ? undefined
                      : { kind: value as CustomValidatorKind, message: v.custom?.message },
                })
              }
            >
              <SelectTrigger id={`custom-${field.id}`} className="w-full">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CUSTOM}>None</SelectItem>
                {CUSTOM_VALIDATOR_KINDS.map((kind) => (
                  <SelectItem key={kind} value={kind}>
                    {CUSTOM_VALIDATORS[kind].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
          {v.custom && (
            <FieldRow label="Custom error message" htmlFor={`custom-msg-${field.id}`}>
              <Input
                id={`custom-msg-${field.id}`}
                placeholder={CUSTOM_VALIDATORS[v.custom.kind].message}
                value={v.custom.message ?? ''}
                onChange={(e) =>
                  patchValidation({
                    custom: { kind: v.custom!.kind, message: e.target.value || undefined },
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

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import type { FieldControlProps } from './types'

export function RadioField({
  field,
  id,
  value,
  onChange,
  onBlur,
  invalid,
  required,
  describedBy,
}: FieldControlProps) {
  return (
    <RadioGroup
      value={typeof value === 'string' ? value : ''}
      onValueChange={onChange}
      onBlur={onBlur}
      aria-labelledby={`${id}-label`}
      aria-invalid={invalid}
      aria-required={required}
      aria-describedby={describedBy}
      className="gap-2"
    >
      {(field.options ?? []).map((opt) => {
        const optionId = `${id}-${opt.value}`
        return (
          <div key={opt.value} className="flex items-center gap-2">
            <RadioGroupItem value={opt.value} id={optionId} />
            <Label htmlFor={optionId} className="font-normal">
              {opt.label}
            </Label>
          </div>
        )
      })}
    </RadioGroup>
  )
}

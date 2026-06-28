import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { FieldControlProps } from './types'

export function CheckboxField({
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
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        aria-invalid={invalid}
        aria-required={required}
        aria-describedby={describedBy}
        checked={value === true}
        onCheckedChange={(checked) => onChange(checked === true)}
        onBlur={onBlur}
      />
      <Label htmlFor={id} className="font-normal">
        {field.label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        )}
      </Label>
    </div>
  )
}

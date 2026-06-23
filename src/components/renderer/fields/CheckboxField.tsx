import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { FieldControlProps } from './types'

export function CheckboxField({ field, id, value, onChange, invalid }: FieldControlProps) {
  const required = Boolean(field.required || field.validation?.required)
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        aria-invalid={invalid}
        checked={value === true}
        onCheckedChange={(checked) => onChange(checked === true)}
      />
      <Label htmlFor={id} className="font-normal">
        {field.label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
    </div>
  )
}

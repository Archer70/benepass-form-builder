import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FieldControlProps } from './types'

export function SelectField({
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
    <Select value={typeof value === 'string' ? value : ''} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        aria-invalid={invalid}
        aria-required={required}
        aria-describedby={describedBy}
        // Radix gives no change-blur, so mark touched when focus leaves the
        // trigger; otherwise mode:'onTouched' never validates this control.
        onBlur={onBlur}
        className="w-full"
      >
        <SelectValue placeholder={field.placeholder || 'Select an option'} />
      </SelectTrigger>
      <SelectContent>
        {(field.options ?? []).map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

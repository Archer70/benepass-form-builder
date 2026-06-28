import { Input } from '@/components/ui/input'
import type { FieldControlProps } from './types'

export function TextField({
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
    <Input
      id={id}
      type="text"
      placeholder={field.placeholder}
      aria-invalid={invalid}
      aria-required={required}
      aria-describedby={describedBy}
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  )
}

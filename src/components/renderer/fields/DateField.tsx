import { Input } from '@/components/ui/input'
import type { FieldControlProps } from './types'

export function DateField({
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
      type="date"
      aria-invalid={invalid}
      aria-required={required}
      aria-describedby={describedBy}
      className="w-fit"
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  )
}

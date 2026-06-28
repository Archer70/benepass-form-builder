import { Textarea } from '@/components/ui/textarea'
import type { FieldControlProps } from './types'

export function TextareaField({
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
    <Textarea
      id={id}
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

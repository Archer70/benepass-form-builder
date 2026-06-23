import { Textarea } from '@/components/ui/textarea'
import type { FieldControlProps } from './types'

export function TextareaField({ field, id, value, onChange, onBlur, invalid }: FieldControlProps) {
  return (
    <Textarea
      id={id}
      placeholder={field.placeholder}
      aria-invalid={invalid}
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  )
}

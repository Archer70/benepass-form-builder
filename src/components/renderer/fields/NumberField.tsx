import { Input } from '@/components/ui/input'
import type { FieldControlProps } from './types'

export function NumberField({ field, id, value, onChange, onBlur, invalid }: FieldControlProps) {
  return (
    <Input
      id={id}
      type="number"
      inputMode="decimal"
      placeholder={field.placeholder}
      aria-invalid={invalid}
      // Keep the raw string in form state; the zod schema coerces on validation.
      value={value === undefined || value === null ? '' : String(value)}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  )
}

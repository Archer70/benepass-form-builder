import { Input } from '@/components/ui/input'
import type { FieldControlProps } from './types'

export function DateField({ id, value, onChange, onBlur, invalid }: FieldControlProps) {
  return (
    <Input
      id={id}
      type="date"
      aria-invalid={invalid}
      className="w-fit"
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  )
}

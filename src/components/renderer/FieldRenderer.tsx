import { Controller, type Control } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import type { FormField } from '@/lib/types'
import { TextField } from './fields/TextField'
import { TextareaField } from './fields/TextareaField'
import { NumberField } from './fields/NumberField'
import { SelectField } from './fields/SelectField'
import { RadioField } from './fields/RadioField'
import { CheckboxField } from './fields/CheckboxField'
import { DateField } from './fields/DateField'
import type { FieldControlProps } from './fields/types'

const CONTROLS = {
  text: TextField,
  textarea: TextareaField,
  number: NumberField,
  select: SelectField,
  radio: RadioField,
  checkbox: CheckboxField,
  date: DateField,
} as const

interface Props {
  field: FormField
  control: Control<Record<string, unknown>>
  error?: string
}

export function FieldRenderer({ field, control, error }: Props) {
  const id = `field-${field.id}`
  const required = Boolean(field.required)
  const isCheckbox = field.type === 'checkbox'
  // A radio group isn't a single labelable control, so it's associated via
  // aria-labelledby (see RadioField) rather than htmlFor.
  const isRadio = field.type === 'radio'
  const Control = CONTROLS[field.type]

  const helpId = field.helpText ? `${id}-help` : undefined
  const errorId = error ? `${id}-error` : undefined
  // Associate help + error text with the control so screen readers announce
  // them (otherwise aria-invalid says "invalid" with no reason).
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-1.5">
      {!isCheckbox && (
        <Label id={`${id}-label`} htmlFor={isRadio ? undefined : id}>
          {field.label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden>
              *
            </span>
          )}
        </Label>
      )}

      <Controller
        name={field.name}
        control={control}
        render={({ field: ctrl }) => {
          const controlProps: FieldControlProps = {
            field,
            id,
            value: ctrl.value,
            onChange: ctrl.onChange,
            onBlur: ctrl.onBlur,
            invalid: Boolean(error),
            required,
            describedBy,
          }
          return <Control {...controlProps} />
        }}
      />

      {field.helpText && (
        <p id={helpId} className="text-xs text-muted-foreground">
          {field.helpText}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

import type { FormField } from '@/lib/types'

/**
 * Common props for presentational field controls. The control is "dumb": it
 * receives the value + change handlers from react-hook-form (via `FieldRenderer`)
 * and renders the appropriate input for its type.
 */
export interface FieldControlProps {
  field: FormField
  id: string
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  invalid: boolean
  /** Whether the field is required (exposed to assistive tech via aria-required). */
  required: boolean
  /** ids of the help/error text to associate via aria-describedby. */
  describedBy?: string
}

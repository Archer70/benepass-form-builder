import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

interface Props {
  label: string
  /** Associates the label with a control by id (accessibility). */
  htmlFor?: string
  /** Helper text shown below the control. */
  hint?: ReactNode
  /** Error text shown below the control. */
  error?: string | null
  children: ReactNode
}

/**
 * A labeled control row used across the builder's property editors:
 * `<Label> + control + optional hint/error`. Centralizes the spacing and the
 * hint/error styling that was previously copy-pasted at every field.
 */
export function FieldRow({ label, htmlFor, hint, error, children }: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  )
}

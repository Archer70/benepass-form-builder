import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  icon: LucideIcon
  title: string
  description?: string
  /** Optional action(s) rendered below the description (e.g. a button). */
  children?: ReactNode
}

/** Shared empty-state placeholder so panels stay visually consistent. */
export function EmptyState({ icon: Icon, title, description, children }: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <Icon className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground/70">{title}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  )
}

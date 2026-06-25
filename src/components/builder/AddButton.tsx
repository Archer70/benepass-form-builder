import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  onClick: () => void
  children: ReactNode
}

/** Full-width dashed "add" button shared by Add field / Add option. */
export function AddButton({ onClick, children }: Props) {
  return (
    <Button
      variant="outline"
      className="w-full border-dashed hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      onClick={onClick}
    >
      <Plus className="size-4" />
      {children}
    </Button>
  )
}

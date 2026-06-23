import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FIELD_TYPE_LABELS, type FormField } from '@/lib/types'

interface Props {
  field: FormField
  selected: boolean
  onSelect: () => void
  onRemove: () => void
}

export function SortableFieldItem({ field, selected, onSelect, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-md border bg-card p-2 text-left transition-colors',
        selected ? 'border-primary ring-1 ring-primary' : 'hover:border-muted-foreground/30',
        isDragging && 'opacity-60 shadow-lg',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 flex-col items-start"
      >
        <span className="w-full truncate text-sm font-medium">
          {field.label || field.name}
          {(field.required || field.validation?.required) && (
            <span className="ml-1 text-destructive">*</span>
          )}
        </span>
        <span className="flex items-center gap-1.5">
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
            {FIELD_TYPE_LABELS[field.type]}
          </Badge>
          <span className="truncate font-mono text-[11px] text-muted-foreground">{field.name}</span>
        </span>
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
        aria-label={`Remove ${field.label || field.name}`}
        onClick={onRemove}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FIELD_TYPE_LABELS, type FormField } from '@/lib/types'
import { FIELD_ICONS } from '@/lib/fieldIcons'

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

  const TypeIcon = FIELD_ICONS[field.type]
  const required = field.required

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2.5 rounded-lg border bg-card p-3 pl-2 transition-colors',
        selected
          ? 'border-primary/40 bg-accent/60'
          : 'hover:border-muted-foreground/30 hover:bg-accent/20',
        isDragging && 'opacity-60 shadow-lg',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none px-0.5 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
        )}
      >
        <TypeIcon className="size-[18px]" />
      </div>

      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
      >
        <span className="flex w-full items-center gap-1 text-[15px] font-medium leading-snug">
          <span className="truncate">{field.label || field.name}</span>
          {required && <span className="text-destructive">*</span>}
        </span>
        <span className="flex w-full min-w-0 items-center gap-1 font-mono text-xs leading-snug text-muted-foreground">
          <span className="opacity-60">#</span>
          <span className="truncate">{field.name}</span>
        </span>
      </button>

      <Badge variant="outline" className="shrink-0 font-normal text-muted-foreground">
        {FIELD_TYPE_LABELS[field.type]}
      </Badge>

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

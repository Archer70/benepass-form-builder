import {
  Type,
  AlignLeft,
  Hash,
  ChevronDownSquare,
  CircleDot,
  CheckSquare,
  Calendar,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FIELD_TYPES, FIELD_TYPE_LABELS, type FieldType } from '@/lib/types'
import { useBuilderStore } from '@/store/useBuilderStore'

const ICONS: Record<FieldType, LucideIcon> = {
  text: Type,
  textarea: AlignLeft,
  number: Hash,
  select: ChevronDownSquare,
  radio: CircleDot,
  checkbox: CheckSquare,
  date: Calendar,
}

export function FieldPalette() {
  const addField = useBuilderStore((s) => s.addField)

  return (
    <div className="grid grid-cols-2 gap-2">
      {FIELD_TYPES.map((type) => {
        const Icon = ICONS[type]
        return (
          <Button
            key={type}
            variant="outline"
            size="sm"
            className="justify-start"
            onClick={() => addField(type)}
          >
            <Icon className="size-4" />
            {FIELD_TYPE_LABELS[type]}
          </Button>
        )
      })}
    </div>
  )
}

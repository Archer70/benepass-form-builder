import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Inbox } from 'lucide-react'
import { SortableFieldItem } from './SortableFieldItem'
import { useBuilderStore } from '@/store/useBuilderStore'

export function FieldList() {
  const fields = useBuilderStore((s) => s.fields)
  const selectedId = useBuilderStore((s) => s.selectedId)
  const selectField = useBuilderStore((s) => s.selectField)
  const removeField = useBuilderStore((s) => s.removeField)
  const moveField = useBuilderStore((s) => s.moveField)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      moveField(String(active.id), String(over.id))
    }
  }

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center text-muted-foreground">
        <Inbox className="size-8" />
        <p className="text-sm">No fields yet.</p>
        <p className="text-xs">Add one from the palette above to get started.</p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {fields.map((field) => (
            <SortableFieldItem
              key={field.id}
              field={field}
              selected={field.id === selectedId}
              onSelect={() => selectField(field.id)}
              onRemove={() => removeField(field.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

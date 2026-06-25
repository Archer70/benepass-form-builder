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
import { EmptyState } from './EmptyState'
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
      <EmptyState
        icon={Inbox}
        title="No fields yet."
        description="Use the “Add field” button below to get started."
      />
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2.5">
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

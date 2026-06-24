import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FIELD_TYPES, FIELD_TYPE_LABELS } from '@/lib/types'
import { FIELD_ICONS } from '@/lib/fieldIcons'
import { useBuilderStore } from '@/store/useBuilderStore'

export function FieldPalette() {
  const addField = useBuilderStore((s) => s.addField)
  const oddCount = FIELD_TYPES.length % 2 === 1

  return (
    <div className="grid grid-cols-2 gap-2">
      {FIELD_TYPES.map((type, i) => {
        const Icon = FIELD_ICONS[type]
        const lastOdd = oddCount && i === FIELD_TYPES.length - 1
        return (
          <Button
            key={type}
            variant="outline"
            className={cn(
              'group h-11 justify-start border-transparent bg-secondary text-[15px] font-medium text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-primary',
              lastOdd && 'col-span-2',
            )}
            onClick={() => addField(type)}
          >
            <Icon className="size-[18px] text-primary transition-transform group-hover:scale-110" />
            {FIELD_TYPE_LABELS[type]}
          </Button>
        )
      })}
    </div>
  )
}

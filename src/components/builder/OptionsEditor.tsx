import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { slugifyName } from '@/lib/fieldFactory'
import type { FieldOption } from '@/lib/types'

interface Props {
  options: FieldOption[]
  onChange: (options: FieldOption[]) => void
}

export function OptionsEditor({ options, onChange }: Props) {
  function update(index: number, patch: Partial<FieldOption>) {
    onChange(options.map((opt, i) => (i === index ? { ...opt, ...patch } : opt)))
  }

  function add() {
    const n = options.length + 1
    onChange([...options, { label: `Option ${n}`, value: `option_${n}` }])
  }

  function remove(index: number) {
    onChange(options.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <Label>Options</Label>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              aria-label={`Option ${i + 1} label`}
              placeholder="Label"
              value={opt.label}
              onChange={(e) => {
                const label = e.target.value
                // Keep value in sync while it still mirrors the label (auto-slug).
                const wasAuto = opt.value === slugifyName(opt.label)
                update(i, wasAuto ? { label, value: slugifyName(label) } : { label })
              }}
            />
            <Input
              aria-label={`Option ${i + 1} value`}
              placeholder="value"
              className="font-mono text-xs"
              value={opt.value}
              onChange={(e) => update(i, { value: e.target.value })}
            />
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
              aria-label={`Remove option ${i + 1}`}
              onClick={() => remove(i)}
              disabled={options.length <= 1}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={add}>
        <Plus className="size-4" />
        Add option
      </Button>
    </div>
  )
}

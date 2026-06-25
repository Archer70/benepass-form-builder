import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AddButton } from './AddButton'
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
      <p className="text-[11px] text-muted-foreground">
        The <span className="font-medium text-foreground/70">label</span> is shown to people filling
        out the form; the <span className="font-medium text-foreground/70">value</span> is what gets
        stored when they pick it.
      </p>

      {/* Column headers, aligned with the inputs below. */}
      <div className="flex items-center gap-2 px-1">
        <span className="flex-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Label
        </span>
        <span className="flex-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Value
        </span>
        <span className="w-8 shrink-0" aria-hidden />
      </div>

      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              aria-label={`Option ${i + 1} label`}
              placeholder="Shown to users"
              className="flex-1"
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
              placeholder="stored_value"
              className="flex-1 font-mono text-xs placeholder:text-muted-foreground/50"
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

      <AddButton onClick={add}>Add option</AddButton>
    </div>
  )
}

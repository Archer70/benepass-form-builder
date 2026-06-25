import { Settings2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OptionsEditor } from './OptionsEditor'
import { ValidationEditor } from './ValidationEditor'
import { ConditionalEditor } from './ConditionalEditor'
import { EmptyState } from './EmptyState'
import { useBuilderStore, useSelectedField } from '@/store/useBuilderStore'
import { OPTION_FIELD_TYPES, type FormField } from '@/lib/types'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-foreground">
      {children}
    </h3>
  )
}

export function PropertiesPanel() {
  const fields = useBuilderStore((s) => s.fields)
  const updateField = useBuilderStore((s) => s.updateField)
  const field = useSelectedField()

  if (!field) {
    return <EmptyState icon={Settings2} title="Select a field to edit its properties." />
  }

  const onUpdate = (patch: Partial<FormField>) => updateField(field.id, patch)
  const nameDuplicate = fields.some((f) => f.id !== field.id && f.name === field.name)
  const showPlaceholder = ['text', 'textarea', 'number', 'date', 'select'].includes(field.type)
  const isOptionField = OPTION_FIELD_TYPES.includes(field.type)

  return (
    <div className="space-y-6">
      {/* Basics */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor={`label-${field.id}`}>Label</Label>
          <Input
            id={`label-${field.id}`}
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`name-${field.id}`}>Name (form key)</Label>
          <Input
            id={`name-${field.id}`}
            className="font-mono text-xs"
            value={field.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            aria-invalid={nameDuplicate}
          />
          {nameDuplicate && (
            <p className="text-[11px] text-destructive">
              Another field already uses this name. Names must be unique.
            </p>
          )}
        </div>

        {showPlaceholder && (
          <div className="space-y-1.5">
            <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
            <Input
              id={`placeholder-${field.id}`}
              value={field.placeholder ?? ''}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor={`help-${field.id}`}>Help text</Label>
          <Input
            id={`help-${field.id}`}
            value={field.helpText ?? ''}
            onChange={(e) => onUpdate({ helpText: e.target.value })}
          />
        </div>

        <DefaultValueControl field={field} onUpdate={onUpdate} />
      </div>

      {isOptionField && field.options && (
        <>
          <Separator />
          <OptionsEditor options={field.options} onChange={(options) => onUpdate({ options })} />
        </>
      )}

      <Separator />
      <div className="space-y-3">
        <SectionLabel>Validation</SectionLabel>
        <ValidationEditor field={field} onUpdate={onUpdate} />
      </div>

      <Separator />
      <div className="space-y-3">
        <SectionLabel>Visibility</SectionLabel>
        <ConditionalEditor field={field} allFields={fields} onUpdate={onUpdate} />
      </div>
    </div>
  )
}

function DefaultValueControl({
  field,
  onUpdate,
}: {
  field: FormField
  onUpdate: (patch: Partial<FormField>) => void
}) {
  if (field.type === 'checkbox') {
    return (
      <div className="flex items-center justify-between">
        <Label htmlFor={`default-${field.id}`}>Checked by default</Label>
        <Switch
          id={`default-${field.id}`}
          checked={Boolean(field.defaultValue)}
          onCheckedChange={(checked) => onUpdate({ defaultValue: checked })}
        />
      </div>
    )
  }

  if (OPTION_FIELD_TYPES.includes(field.type) && field.options) {
    const current = typeof field.defaultValue === 'string' ? field.defaultValue : ''
    return (
      <div className="space-y-1.5">
        <Label>Default value</Label>
        <Select
          value={current || '__none__'}
          onValueChange={(value) =>
            onUpdate({ defaultValue: value === '__none__' ? undefined : value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {field.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  const inputType = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'
  return (
    <div className="space-y-1.5">
      <Label htmlFor={`default-${field.id}`}>Default value</Label>
      <Input
        id={`default-${field.id}`}
        type={inputType}
        value={
          field.defaultValue === undefined || field.defaultValue === null
            ? ''
            : String(field.defaultValue)
        }
        onChange={(e) =>
          onUpdate({ defaultValue: e.target.value === '' ? undefined : e.target.value })
        }
      />
    </div>
  )
}

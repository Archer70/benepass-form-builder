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
import { FieldRow } from './FieldRow'
import { useBuilderStore, useSelectedField } from '@/store/useBuilderStore'
import {
  FIELD_CAPABILITIES,
  FIELD_TYPES,
  FIELD_TYPE_LABELS,
  OPTION_FIELD_TYPES,
  type FieldType,
  type FormField,
} from '@/lib/types'
import { FIELD_ICONS } from '@/lib/fieldIcons'
import { hasDefaultLabel, hasDefaultName } from '@/lib/fieldFactory'

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
  const changeFieldType = useBuilderStore((s) => s.changeFieldType)
  const field = useSelectedField()

  if (!field) {
    return <EmptyState icon={Settings2} title="Select a field to edit its properties." />
  }

  const onUpdate = (patch: Partial<FormField>) => updateField(field.id, patch)
  const nameDuplicate = fields.some((f) => f.id !== field.id && f.name === field.name)
  const caps = FIELD_CAPABILITIES[field.type]

  return (
    <div className="space-y-6">
      {/* Basics */}
      <div className="space-y-3">
        <FieldRow label="Field type" htmlFor={`type-${field.id}`}>
          <Select
            value={field.type}
            onValueChange={(value) => changeFieldType(field.id, value as FieldType)}
          >
            <SelectTrigger id={`type-${field.id}`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map((t) => {
                const Icon = FIELD_ICONS[t]
                return (
                  <SelectItem key={t} value={t}>
                    <Icon className="size-4 text-muted-foreground" />
                    {FIELD_TYPE_LABELS[t]}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </FieldRow>

        <FieldRow label="Label" htmlFor={`label-${field.id}`}>
          <Input
            id={`label-${field.id}`}
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            // Select-all on first focus so the placeholder default can be typed
            // over; once it holds a real value, focus places the cursor normally.
            onFocus={(e) => hasDefaultLabel(field.label) && e.target.select()}
          />
        </FieldRow>

        <FieldRow
          label="Name (form key)"
          htmlFor={`name-${field.id}`}
          error={nameDuplicate ? 'Another field already uses this name. Names must be unique.' : null}
        >
          <Input
            id={`name-${field.id}`}
            className="font-mono text-xs"
            value={field.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            onFocus={(e) => hasDefaultName(field.name) && e.target.select()}
            aria-invalid={nameDuplicate}
          />
        </FieldRow>

        {caps.hasPlaceholder && (
          <FieldRow label="Placeholder" htmlFor={`placeholder-${field.id}`}>
            <Input
              id={`placeholder-${field.id}`}
              value={field.placeholder ?? ''}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
            />
          </FieldRow>
        )}

        <FieldRow label="Help text" htmlFor={`help-${field.id}`}>
          <Input
            id={`help-${field.id}`}
            value={field.helpText ?? ''}
            onChange={(e) => onUpdate({ helpText: e.target.value })}
          />
        </FieldRow>

        <DefaultValueControl field={field} onUpdate={onUpdate} />
      </div>

      {caps.hasOptions && field.options && (
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
      <FieldRow label="Default value">
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
      </FieldRow>
    )
  }

  const inputType = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'
  return (
    <FieldRow label="Default value" htmlFor={`default-${field.id}`}>
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
    </FieldRow>
  )
}

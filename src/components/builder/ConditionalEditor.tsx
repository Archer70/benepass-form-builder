import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FormField, VisibilityOperator } from '@/lib/types'

interface Props {
  field: FormField
  allFields: FormField[]
  onUpdate: (patch: Partial<FormField>) => void
}

const OPERATOR_LABELS: Record<VisibilityOperator, string> = {
  equals: 'equals',
  notEquals: 'does not equal',
  in: 'is one of',
  truthy: 'is filled in',
}

export function ConditionalEditor({ field, allFields, onUpdate }: Props) {
  const condition = field.visibleWhen
  const enabled = Boolean(condition)

  // Candidate controlling fields: anything other than this field.
  const candidates = allFields.filter((f) => f.id !== field.id)
  const controller = candidates.find((f) => f.name === condition?.field)

  function enable(on: boolean) {
    if (on) {
      const first = candidates[0]
      onUpdate({
        visibleWhen: { field: first?.name ?? '', operator: 'equals', value: '' },
      })
    } else {
      onUpdate({ visibleWhen: undefined })
    }
  }

  function patch(next: Partial<NonNullable<FormField['visibleWhen']>>) {
    if (!condition) return
    onUpdate({ visibleWhen: { ...condition, ...next } })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor={`cond-${field.id}`}>Conditional visibility</Label>
          <p className="text-[11px] text-muted-foreground">Only show this field when…</p>
        </div>
        <Switch
          id={`cond-${field.id}`}
          checked={enabled}
          onCheckedChange={enable}
          disabled={candidates.length === 0}
        />
      </div>

      {candidates.length === 0 && (
        <p className="text-[11px] text-muted-foreground">Add another field to use as a condition.</p>
      )}

      {enabled && condition && (
        <div className="space-y-3 rounded-md border bg-muted/30 p-3">
          <div className="space-y-1.5">
            <Label>Field</Label>
            <Select value={condition.field} onValueChange={(value) => patch({ field: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a field" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((f) => (
                  <SelectItem key={f.id} value={f.name}>
                    {f.label || f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Condition</Label>
            <Select
              value={condition.operator}
              onValueChange={(value) => patch({ operator: value as VisibilityOperator })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(OPERATOR_LABELS) as VisibilityOperator[]).map((op) => (
                  <SelectItem key={op} value={op}>
                    {OPERATOR_LABELS[op]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {condition.operator !== 'truthy' && (
            <div className="space-y-1.5">
              <Label>Value{condition.operator === 'in' && ' (comma-separated)'}</Label>
              {controller?.options && condition.operator !== 'in' ? (
                <Select
                  value={typeof condition.value === 'string' ? condition.value : ''}
                  onValueChange={(value) => patch({ value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a value" />
                  </SelectTrigger>
                  <SelectContent>
                    {controller.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={
                    Array.isArray(condition.value)
                      ? condition.value.join(', ')
                      : (condition.value ?? '')
                  }
                  placeholder={condition.operator === 'in' ? 'US, CA, UK' : 'US'}
                  onChange={(e) => {
                    const raw = e.target.value
                    patch({
                      value:
                        condition.operator === 'in'
                          ? raw.split(',').map((s) => s.trim()).filter(Boolean)
                          : raw,
                    })
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

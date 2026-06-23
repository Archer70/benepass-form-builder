import { useState } from 'react'
import { Save, FolderOpen, RotateCcw, ArrowDownUp } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImportExportDialog } from './ImportExportDialog'
import { useBuilderStore } from '@/store/useBuilderStore'
import { saveSchema, loadSchema, clearSchema } from '@/lib/storage'

export function BuilderToolbar() {
  const title = useBuilderStore((s) => s.title)
  const setTitle = useBuilderStore((s) => s.setTitle)
  const getSchema = useBuilderStore((s) => s.getSchema)
  const hydrate = useBuilderStore((s) => s.hydrate)
  const reset = useBuilderStore((s) => s.reset)

  const [ioOpen, setIoOpen] = useState(false)

  function handleSave() {
    saveSchema(getSchema())
    toast.success('Saved to this browser')
  }

  function handleLoad() {
    const schema = loadSchema()
    if (!schema) {
      toast.error('No saved form found')
      return
    }
    hydrate(schema)
    toast.success('Loaded saved form')
  }

  function handleReset() {
    if (!window.confirm('Reset the builder? This clears the current form and saved data.')) return
    reset()
    clearSchema()
    toast.success('Builder reset')
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        aria-label="Form title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-9 w-56 text-base font-semibold"
      />
      <div className="flex-1" />
      <Button variant="outline" size="sm" onClick={handleSave}>
        <Save className="size-4" />
        Save
      </Button>
      <Button variant="outline" size="sm" onClick={handleLoad}>
        <FolderOpen className="size-4" />
        Load
      </Button>
      <Button variant="outline" size="sm" onClick={() => setIoOpen(true)}>
        <ArrowDownUp className="size-4" />
        Import / Export
      </Button>
      <Button variant="ghost" size="sm" onClick={handleReset}>
        <RotateCcw className="size-4" />
        Reset
      </Button>

      <ImportExportDialog open={ioOpen} onOpenChange={setIoOpen} />
    </div>
  )
}

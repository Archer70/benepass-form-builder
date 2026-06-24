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
        className="h-9 w-56 border-white/20 bg-white/10 text-base font-semibold text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-white/20"
      />
      <div className="flex-1" />
      <Button size="sm" onClick={handleSave} className="bg-primary text-white hover:bg-[var(--bp-pink-dark)]">
        <Save className="size-4" />
        Save
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLoad}
        className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
      >
        <FolderOpen className="size-4" />
        Load
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIoOpen(true)}
        className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
      >
        <ArrowDownUp className="size-4" />
        Import / Export
      </Button>
      <div className="mx-1 h-5 w-px bg-white/20" aria-hidden />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="text-white/60 hover:bg-white/10 hover:text-white"
      >
        <RotateCcw className="size-4" />
        Reset
      </Button>

      <ImportExportDialog open={ioOpen} onOpenChange={setIoOpen} />
    </div>
  )
}

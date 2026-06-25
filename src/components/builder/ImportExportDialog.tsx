import { useMemo, useState } from 'react'
import { Copy, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useBuilderStore } from '@/store/useBuilderStore'
import { parseFormSchema } from '@/lib/metaSchema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When set, exporting is blocked (e.g. duplicate field names) and the reason shown. */
  exportBlockReason?: string | null
}

export function ImportExportDialog({ open, onOpenChange, exportBlockReason }: Props) {
  const getSchema = useBuilderStore((s) => s.getSchema)
  const hydrate = useBuilderStore((s) => s.hydrate)

  const exported = useMemo(
    () => (open ? JSON.stringify(getSchema(), null, 2) : ''),
    [open, getSchema],
  )

  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)

  function copyExport() {
    navigator.clipboard.writeText(exported).then(
      () => toast.success('Schema copied to clipboard'),
      () => toast.error('Could not copy to clipboard'),
    )
  }

  function downloadExport() {
    const blob = new Blob([exported], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'form-schema.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    file.text().then((text) => {
      setImportText(text)
      setImportError(null)
    })
    e.target.value = ''
  }

  function doImport() {
    const result = parseFormSchema(importText)
    if (!result.success || !result.data) {
      setImportError(result.error ?? 'Invalid schema')
      return
    }
    hydrate(result.data)
    setImportError(null)
    setImportText('')
    onOpenChange(false)
    toast.success('Form schema imported')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import / Export schema</DialogTitle>
          <DialogDescription>
            Move your form between sessions or share it as portable JSON.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export">
          <TabsList className="w-full">
            <TabsTrigger value="export" className="flex-1">
              Export
            </TabsTrigger>
            <TabsTrigger value="import" className="flex-1">
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-3">
            {exportBlockReason && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {exportBlockReason} — resolve it before exporting.
              </p>
            )}
            <Textarea readOnly value={exported} className="h-72 font-mono text-xs" />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyExport}
                disabled={!!exportBlockReason}
              >
                <Copy className="size-4" />
                Copy
              </Button>
              <Button size="sm" onClick={downloadExport} disabled={!!exportBlockReason}>
                <Download className="size-4" />
                Download .json
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-3">
            <Textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value)
                setImportError(null)
              }}
              placeholder="Paste form schema JSON here…"
              className="h-72 font-mono text-xs"
            />
            {importError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {importError}
              </p>
            )}
            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  <Upload className="size-4" />
                  Upload file
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="sr-only"
                    onChange={handleFile}
                  />
                </label>
              </Button>
              <Button size="sm" onClick={doImport} disabled={!importText.trim()}>
                Import &amp; replace
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

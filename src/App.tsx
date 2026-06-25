import { useMemo, useState } from 'react'
import { LayoutTemplate, Smartphone, Tablet, Monitor, Pencil, type LucideIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { createSchema } from '@/lib/types'
import { BuilderToolbar } from '@/components/builder/BuilderToolbar'
import { AddButton } from '@/components/builder/AddButton'
import { FieldList } from '@/components/builder/FieldList'
import { PropertiesPanel } from '@/components/builder/PropertiesPanel'
import { FormRenderer } from '@/components/renderer/FormRenderer'
import { useBuilderStore } from '@/store/useBuilderStore'

type ViewportId = 'mobile' | 'tablet' | 'desktop'

const VIEWPORTS: { id: ViewportId; label: string; icon: LucideIcon; width: string }[] = [
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: 'max-w-sm' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: 'max-w-lg' },
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: 'max-w-2xl' },
]

function App() {
  const title = useBuilderStore((s) => s.title)
  const fields = useBuilderStore((s) => s.fields)
  const addField = useBuilderStore((s) => s.addField)
  const setTitle = useBuilderStore((s) => s.setTitle)
  const [viewport, setViewport] = useState<ViewportId>('desktop')

  const schema = useMemo(() => createSchema(title, fields), [title, fields])
  // Remount the preview form whenever the schema changes so RHF picks up new
  // defaults/fields rather than holding stale mount-time values.
  const schemaKey = useMemo(() => JSON.stringify(schema), [schema])
  const previewWidth = VIEWPORTS.find((v) => v.id === viewport)!.width

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="bg-brand-navy px-4 py-3 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2">
          <LayoutTemplate className="size-6 shrink-0 text-primary" />
          <h1 className="text-xl font-semibold text-white">Form Builder</h1>
          <div className="ml-auto">
            <BuilderToolbar />
          </div>
        </div>
      </header>

      <Tabs defaultValue="build" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="bg-brand-navy">
          <div className="mx-auto flex max-w-6xl justify-center px-6 py-2">
            <TabsList variant="line" className="gap-6">
              <TabsTrigger
                value="build"
                className="flex-none px-0 text-base text-white/60 hover:text-white"
              >
                Build
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="flex-none px-0 text-base text-white/60 hover:text-white"
              >
                Preview
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Build */}
        <TabsContent value="build" className="m-0 min-h-0 flex-1">
          <div className="mx-auto grid h-full max-w-6xl grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <Card className="flex min-h-0 flex-col">
              <CardHeader>
                <div className="group relative">
                  <Input
                    aria-label="Form title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Untitled form"
                    className="peer h-auto rounded-none border-0 border-b border-border bg-transparent px-0 py-1.5 pr-9 text-2xl font-semibold shadow-none transition-colors hover:border-muted-foreground/50 focus-visible:border-primary focus-visible:ring-0 md:text-2xl"
                  />
                  <Pencil className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground peer-focus-visible:text-primary" />
                </div>
              </CardHeader>
              <CardContent className="min-h-0 flex-1 overflow-y-auto">
                <FieldList />
              </CardContent>
              <CardFooter className="border-t pt-4">
                <AddButton onClick={() => addField('text')}>Add field</AddButton>
              </CardFooter>
            </Card>

            <aside className="min-h-0">
              <Card className="flex h-full min-h-0 flex-col">
                <CardHeader>
                  <CardTitle className="text-base">Field Properties</CardTitle>
                </CardHeader>
                <CardContent className="min-h-0 flex-1 overflow-y-auto">
                  <PropertiesPanel />
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview" className="m-0 min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl p-6">
            <div className="mb-4 flex justify-center">
              <div className="inline-flex items-center gap-1 rounded-lg border bg-background p-1">
                {VIEWPORTS.map((v) => {
                  const Icon = v.icon
                  return (
                    <Button
                      key={v.id}
                      type="button"
                      size="sm"
                      variant={viewport === v.id ? 'secondary' : 'ghost'}
                      className="gap-1.5"
                      aria-pressed={viewport === v.id}
                      onClick={() => setViewport(v.id)}
                    >
                      <Icon className="size-4" />
                      <span className="hidden sm:inline">{v.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className={cn('mx-auto transition-all duration-300', previewWidth)}>
              <Card>
                <CardHeader>
                  <CardTitle>{title || 'Untitled form'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormRenderer key={schemaKey} schema={schema} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Toaster position="bottom-left" />
    </div>
  )
}

export default App

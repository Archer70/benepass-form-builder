import { useMemo, useState } from 'react'
import { LayoutTemplate, Smartphone, Tablet, Monitor, type LucideIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { BuilderToolbar } from '@/components/builder/BuilderToolbar'
import { FieldPalette } from '@/components/builder/FieldPalette'
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
  const [viewport, setViewport] = useState<ViewportId>('desktop')

  const schema = useMemo(() => ({ version: 1 as const, title, fields }), [title, fields])
  const previewWidth = VIEWPORTS.find((v) => v.id === viewport)!.width

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="bg-[var(--bp-navy)] px-4 py-4 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <LayoutTemplate className="size-6 text-primary" />
            <h1 className="text-xl font-semibold text-white">Form Builder</h1>
            <span className="hidden text-sm text-white/55 sm:inline">
              Design, validate, and preview forms from a JSON schema
            </span>
          </div>
          <BuilderToolbar />
        </div>
      </header>

      <Tabs defaultValue="build" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="border-b bg-card px-4">
          <div className="mx-auto max-w-6xl py-2.5">
            <TabsList variant="line">
              <TabsTrigger
                value="build"
                className="flex-none px-3.5 text-base after:bg-primary! data-[state=active]:text-primary"
              >
                Build
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="flex-none px-3.5 text-base after:bg-primary! data-[state=active]:text-primary"
              >
                Preview
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Build */}
        <TabsContent value="build" className="m-0 min-h-0 flex-1">
          <div className="mx-auto grid h-full max-w-6xl grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <section className="flex min-h-0 flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add a field</CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldPalette />
                </CardContent>
              </Card>

              <Card className="flex min-h-0 flex-1 flex-col">
                <CardHeader>
                  <CardTitle className="text-base">Fields</CardTitle>
                </CardHeader>
                <CardContent className="min-h-0 flex-1 overflow-y-auto">
                  <FieldList />
                </CardContent>
              </Card>
            </section>

            <aside className="min-h-0">
              <Card className="h-full overflow-y-auto py-0">
                <PropertiesPanel />
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
                  <FormRenderer schema={schema} />
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

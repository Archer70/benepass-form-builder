import { useMemo } from 'react'
import { LayoutTemplate } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'
import { BuilderToolbar } from '@/components/builder/BuilderToolbar'
import { FieldPalette } from '@/components/builder/FieldPalette'
import { FieldList } from '@/components/builder/FieldList'
import { PropertiesPanel } from '@/components/builder/PropertiesPanel'
import { FormRenderer } from '@/components/renderer/FormRenderer'
import { useBuilderStore } from '@/store/useBuilderStore'

function App() {
  const title = useBuilderStore((s) => s.title)
  const fields = useBuilderStore((s) => s.fields)

  const schema = useMemo(() => ({ version: 1 as const, title, fields }), [title, fields])

  return (
    <div className="flex h-screen flex-col bg-muted/20">
      <header className="border-b bg-background px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-col gap-3">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="size-5 text-primary" />
            <h1 className="text-lg font-semibold">Form Builder</h1>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Design, validate, and preview forms from a JSON schema
            </span>
          </div>
          <BuilderToolbar />
        </div>
      </header>

      <Tabs defaultValue="build" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="border-b bg-background px-4">
          <div className="mx-auto max-w-6xl py-2">
            <TabsList>
              <TabsTrigger value="build">Build</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Build */}
        <TabsContent value="build" className="m-0 min-h-0 flex-1">
          <div className="mx-auto grid h-full max-w-6xl grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="flex min-h-0 flex-col gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Add a field</CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldPalette />
                </CardContent>
              </Card>

              <Card className="flex min-h-0 flex-1 flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Fields</CardTitle>
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
          <div className="mx-auto max-w-2xl p-4">
            <Card>
              <CardHeader>
                <CardTitle>{title || 'Untitled form'}</CardTitle>
              </CardHeader>
              <CardContent>
                <FormRenderer schema={schema} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Toaster richColors position="top-right" />
    </div>
  )
}

export default App

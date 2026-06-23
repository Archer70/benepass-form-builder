import { CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SubmitResult } from '@/lib/mockSubmit'

export function SubmitStatus({ result }: { result: SubmitResult | null }) {
  if (!result) return null

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-2 rounded-md border p-3 text-sm',
        result.ok
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : 'border-destructive/40 bg-destructive/10 text-destructive',
      )}
    >
      {result.ok ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
      )}
      <div className="min-w-0 space-y-2">
        <p className="font-medium">{result.message}</p>
        {result.ok && result.data && (
          <pre className="overflow-x-auto rounded bg-background/60 p-2 text-xs text-foreground">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

export interface SubmitResult {
  ok: boolean
  message: string
  /** Echoed submitted values, present on success. */
  data?: Record<string, unknown>
}

const SUCCESS_MESSAGES = ['Form submitted successfully!']
const FAILURE_MESSAGES = [
  'Server error: please try again.',
  'Network timeout while submitting.',
  'The server rejected the submission.',
]

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * Simulate a backend submission: ~1s latency, then random success/failure so
 * the renderer's loading and error states can be exercised.
 */
export async function mockSubmit(
  values: Record<string, unknown>,
  { failureRate = 0.5, delayMs = 1000 }: { failureRate?: number; delayMs?: number } = {},
): Promise<SubmitResult> {
  await new Promise((resolve) => setTimeout(resolve, delayMs))

  if (Math.random() < failureRate) {
    return { ok: false, message: pick(FAILURE_MESSAGES) }
  }
  return { ok: true, message: pick(SUCCESS_MESSAGES), data: values }
}

/** Compile a user-supplied regex pattern, returning null if it's invalid. */
export function compileRegex(pattern: string): RegExp | null {
  try {
    return new RegExp(pattern)
  } catch {
    return null
  }
}

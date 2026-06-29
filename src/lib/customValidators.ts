/**
 * Curated "custom" validators — a small, fixed set of named checks the form
 * author can pick from (each compiles to a zod `.refine()` in buildZodSchema).
 *
 * This replaces an earlier free-text expression DSL: the requirement only asks
 * for "custom rules (using zod/yup)", and a curated list is simpler, safer, and
 * clearer to use than a mini-language — no parser, no eval, no syntax to learn.
 * All validators operate on string values (offered on text/textarea fields).
 */

export const CUSTOM_VALIDATOR_KINDS = [
  'email',
  'url',
  'alphanumeric',
  'no_whitespace',
  'lowercase',
] as const

export type CustomValidatorKind = (typeof CUSTOM_VALIDATOR_KINDS)[number]

interface CustomValidator {
  /** Label shown in the builder's dropdown. */
  label: string
  /** Returns true when `value` satisfies the rule. */
  test: (value: string) => boolean
  /** Default error message (the author can override it). */
  message: string
}

export const CUSTOM_VALIDATORS: Record<CustomValidatorKind, CustomValidator> = {
  email: {
    label: 'Email address',
    test: (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
    message: 'Enter a valid email address',
  },
  url: {
    label: 'URL',
    test: (v) => {
      try {
        new URL(v)
        return true
      } catch {
        return false
      }
    },
    message: 'Enter a valid URL',
  },
  alphanumeric: {
    label: 'Letters and numbers only',
    test: (v) => /^[a-zA-Z0-9]+$/.test(v),
    message: 'Use letters and numbers only',
  },
  no_whitespace: {
    label: 'No spaces',
    test: (v) => !/\s/.test(v),
    message: 'Spaces are not allowed',
  },
  lowercase: {
    label: 'Lowercase only',
    test: (v) => v === v.toLowerCase(),
    message: 'Must be lowercase',
  },
}

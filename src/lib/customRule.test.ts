import { describe, it, expect } from 'vitest'
import { evaluateCustomRule, validateCustomExpression } from './customRule'

describe('evaluateCustomRule', () => {
  it('compares strings', () => {
    expect(evaluateCustomRule('value !== "admin"', 'jane')).toBe(true)
    expect(evaluateCustomRule('value !== "admin"', 'admin')).toBe(false)
    expect(evaluateCustomRule('value === "yes"', 'yes')).toBe(true)
  })

  it('uses value.length', () => {
    expect(evaluateCustomRule('value.length >= 3', 'abc')).toBe(true)
    expect(evaluateCustomRule('value.length >= 3', 'ab')).toBe(false)
  })

  it('handles logical operators and grouping', () => {
    expect(evaluateCustomRule('value.length >= 3 && value.length <= 5', 'abcd')).toBe(true)
    expect(evaluateCustomRule('value.length >= 3 && value.length <= 5', 'abcdef')).toBe(false)
    expect(evaluateCustomRule('value === "a" || value === "b"', 'b')).toBe(true)
  })

  it('compares numbers', () => {
    expect(evaluateCustomRule('value > 0 && value < 100', 42)).toBe(true)
    expect(evaluateCustomRule('value > 0 && value < 100', 200)).toBe(false)
  })

  it('supports negation', () => {
    expect(evaluateCustomRule('!(value === "x")', 'y')).toBe(true)
  })

  it('relational operators are numeric and throw on non-numeric operands', () => {
    expect(evaluateCustomRule('value.length > 3', 'abcd')).toBe(true)
    expect(() => evaluateCustomRule('value > 3', 'abc')).toThrow()
  })

  it('throws on malformed expressions', () => {
    expect(() => evaluateCustomRule('value &&&', 'x')).toThrow()
    expect(() => evaluateCustomRule('foo(bar)', 'x')).toThrow()
  })
})

describe('validateCustomExpression', () => {
  it('returns null for valid or empty expressions', () => {
    expect(validateCustomExpression('')).toBeNull()
    expect(validateCustomExpression('value.length > 2')).toBeNull()
  })

  it('returns an error message for invalid expressions', () => {
    expect(validateCustomExpression('value ===')).not.toBeNull()
  })
})

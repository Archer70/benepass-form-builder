/**
 * A tiny, safe predicate DSL for `custom` validation rules.
 *
 * We deliberately avoid `eval`/`new Function`. Instead a minimal
 * recursive-descent parser evaluates expressions against a single bound
 * variable `value` (the current field value). Supported grammar:
 *
 *   expr        := or
 *   or          := and ( '||' and )*
 *   and         := not ( '&&' not )*
 *   not         := '!' not | comparison
 *   comparison  := primary ( OP primary )?      OP = === !== == != >= <= > <
 *   primary     := '(' expr ')' | number | string | bool | value
 *   value       := 'value' ( '.length' )?
 *
 * Examples:
 *   value !== "forbidden"
 *   value.length >= 3 && value.length <= 20
 *   value > 0 && value < 100
 */

type Token =
  | { type: 'num'; value: number }
  | { type: 'str'; value: string }
  | { type: 'bool'; value: boolean }
  | { type: 'ident'; value: string }
  | { type: 'op'; value: string }
  | { type: 'punc'; value: string }

const COMPARISON_OPS = ['===', '!==', '==', '!=', '>=', '<=', '>', '<']
const MULTI_CHAR = [...COMPARISON_OPS, '&&', '||']

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < input.length) {
    const ch = input[i]
    if (/\s/.test(ch)) {
      i++
      continue
    }
    // strings
    if (ch === '"' || ch === "'") {
      const quote = ch
      let j = i + 1
      let str = ''
      while (j < input.length && input[j] !== quote) {
        if (input[j] === '\\' && j + 1 < input.length) {
          str += input[j + 1]
          j += 2
          continue
        }
        str += input[j]
        j++
      }
      if (j >= input.length) throw new Error('Unterminated string literal')
      tokens.push({ type: 'str', value: str })
      i = j + 1
      continue
    }
    // numbers
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(input[i + 1] ?? ''))) {
      let j = i
      while (j < input.length && /[0-9.]/.test(input[j])) j++
      tokens.push({ type: 'num', value: Number(input.slice(i, j)) })
      i = j
      continue
    }
    // identifiers / keywords
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i
      while (j < input.length && /[a-zA-Z_.]/.test(input[j])) j++
      const word = input.slice(i, j)
      if (word === 'true' || word === 'false') {
        tokens.push({ type: 'bool', value: word === 'true' })
      } else {
        tokens.push({ type: 'ident', value: word })
      }
      i = j
      continue
    }
    // multi-char operators
    const three = input.slice(i, i + 3)
    const two = input.slice(i, i + 2)
    const matched = MULTI_CHAR.find((op) => op === three) ?? MULTI_CHAR.find((op) => op === two)
    if (matched) {
      tokens.push({ type: 'op', value: matched })
      i += matched.length
      continue
    }
    if (ch === '>' || ch === '<') {
      tokens.push({ type: 'op', value: ch })
      i++
      continue
    }
    if (ch === '!') {
      tokens.push({ type: 'op', value: '!' })
      i++
      continue
    }
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'punc', value: ch })
      i++
      continue
    }
    throw new Error(`Unexpected character: ${ch}`)
  }
  return tokens
}

type Value = string | number | boolean | undefined

class Parser {
  private pos = 0
  private tokens: Token[]
  private fieldValue: unknown

  constructor(tokens: Token[], fieldValue: unknown) {
    this.tokens = tokens
    this.fieldValue = fieldValue
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos]
  }

  private next(): Token | undefined {
    return this.tokens[this.pos++]
  }

  parse(): boolean {
    const result = this.parseOr()
    if (this.pos !== this.tokens.length) throw new Error('Unexpected trailing tokens')
    return Boolean(result)
  }

  private parseOr(): Value {
    let left = this.parseAnd()
    while (this.peek()?.type === 'op' && this.peek()?.value === '||') {
      this.next()
      const right = this.parseAnd()
      left = Boolean(left) || Boolean(right)
    }
    return left
  }

  private parseAnd(): Value {
    let left = this.parseNot()
    while (this.peek()?.type === 'op' && this.peek()?.value === '&&') {
      this.next()
      const right = this.parseNot()
      left = Boolean(left) && Boolean(right)
    }
    return left
  }

  private parseNot(): Value {
    if (this.peek()?.type === 'op' && this.peek()?.value === '!') {
      this.next()
      return !this.parseNot()
    }
    return this.parseComparison()
  }

  private parseComparison(): Value {
    const left = this.parsePrimary()
    const tok = this.peek()
    if (tok?.type === 'op' && COMPARISON_OPS.includes(tok.value)) {
      this.next()
      const right = this.parsePrimary()
      return compare(tok.value, left, right)
    }
    return left
  }

  private parsePrimary(): Value {
    const tok = this.next()
    if (!tok) throw new Error('Unexpected end of expression')
    if (tok.type === 'punc' && tok.value === '(') {
      const inner = this.parseOr()
      const close = this.next()
      if (!close || close.type !== 'punc' || close.value !== ')') {
        throw new Error('Expected closing parenthesis')
      }
      return inner
    }
    if (tok.type === 'num') return tok.value
    if (tok.type === 'str') return tok.value
    if (tok.type === 'bool') return tok.value
    if (tok.type === 'ident') return this.resolveIdent(tok.value)
    throw new Error(`Unexpected token: ${JSON.stringify(tok)}`)
  }

  private resolveIdent(word: string): Value {
    if (word === 'value') return this.fieldValue as Value
    if (word === 'value.length') {
      const v = this.fieldValue
      if (typeof v === 'string' || Array.isArray(v)) return v.length
      return 0
    }
    throw new Error(`Unknown identifier: ${word}`)
  }
}

function compare(op: string, left: Value, right: Value): boolean {
  switch (op) {
    case '===':
    case '==':
      return left === right
    case '!==':
    case '!=':
      return left !== right
    case '>':
      return (left as number) > (right as number)
    case '>=':
      return (left as number) >= (right as number)
    case '<':
      return (left as number) < (right as number)
    case '<=':
      return (left as number) <= (right as number)
    default:
      throw new Error(`Unknown operator: ${op}`)
  }
}

/**
 * Evaluate a custom rule expression against a field value.
 * Returns `true` when the value is considered valid.
 * Throws on malformed expressions (callers decide how to handle).
 */
export function evaluateCustomRule(expression: string, value: unknown): boolean {
  const tokens = tokenize(expression)
  if (tokens.length === 0) return true
  return new Parser(tokens, value).parse()
}

/**
 * Validate that an expression parses. Returns an error message, or null if OK.
 * Used by the builder's validation editor for live feedback.
 */
export function validateCustomExpression(expression: string): string | null {
  if (!expression.trim()) return null
  try {
    evaluateCustomRule(expression, '')
    return null
  } catch (err) {
    return err instanceof Error ? err.message : 'Invalid expression'
  }
}

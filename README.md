# Form Builder

A small React app for **visually designing forms**, **exporting/importing** them as JSON, and
**rendering** a working form with validation, conditional visibility, and a mock submission flow.

A single `FormSchema` (plain JSON) is the source of truth — the builder edits it, the renderer
consumes it, and import/export simply (de)serialize it. That one decision makes every feature
(persistence, export/import, live preview) fall out naturally.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check (tsc -b) + production build
npm test           # vitest (or: npx vitest run)
npm run preview    # serve the production build
```

> **Node:** the toolchain is pinned to **Vite 6**, which supports Node ≥ 20.0 (verified on 20.12).

## What it does

- **Design visually** — add any of 7 field types (`text`, `textarea`, `number`, `select`,
  `radio`, `checkbox`, `date`), reorder by **drag & drop** (dnd-kit), and edit every property:
  `label`, `name`, `placeholder`, `helpText`, `type`, `required`, `defaultValue`, options.
- **Validation** — per field: `required`, `min`/`max` (length or value), `regex`, and a safe
  `custom` rule DSL. Compiled to a [zod](https://zod.dev) schema at render time.
- **Conditional visibility** — show a field only when another satisfies a condition
  (e.g. *State* appears only when *Country* `equals` `US`). Hidden fields are excluded from
  validation so they never block submission.
- **Persistence** — explicit **Save** / **Load** / **Reset** to `localStorage`.
- **Import / Export** — copy/download the schema as JSON, or paste/upload to hydrate. Imports are
  validated against a zod "meta-schema" with friendly errors.
- **Live preview & mock submit** — the Preview tab renders the real form
  ([react-hook-form](https://react-hook-form.com)); submission simulates a ~1s round-trip with
  random success/failure to exercise loading and error states.

## Architecture

```
src/
  lib/
    types.ts          # FormSchema / FormField data model (source of truth)
    buildZodSchema.ts  # FormField[] + values -> zod schema (visibility-aware)
    visibility.ts      # conditional-visibility evaluator
    customRule.ts      # safe predicate DSL for `custom` rules (no eval)
    metaSchema.ts      # zod schema-of-the-schema; validates imported JSON
    storage.ts         # localStorage save/load/reset
    mockSubmit.ts      # latency + random success/failure
    fieldFactory.ts    # default field per type, unique-name helpers
    demoSchema.ts      # seeded starter form
  store/
    useBuilderStore.ts  # zustand: fields, selection, title; add/remove/move/update
  components/
    builder/   # FieldPalette, FieldList + SortableFieldItem, PropertiesPanel,
               # ValidationEditor, ConditionalEditor, OptionsEditor,
               # BuilderToolbar, ImportExportDialog
    renderer/  # FormRenderer, FieldRenderer, SubmitStatus, fields/<one per type>
    ui/        # shadcn/ui primitives
  App.tsx      # header + Build / Preview tabs
```

**Stack:** Vite · React 19 · TypeScript · Tailwind v4 + shadcn/ui · zod · react-hook-form ·
dnd-kit · zustand.

### Notable design decisions

- **Validation is data, not code.** `buildZodSchema(fields, values)` rebuilds the zod schema from
  the current values on every validation, so conditional visibility and validation stay consistent
  by construction — hidden fields are simply omitted from the schema.
- **Safe custom rules.** `custom` expressions are evaluated by a tiny recursive-descent parser
  (`customRule.ts`), never `eval`/`new Function`. Supported grammar: `value`, `value.length`,
  comparisons, `&&`/`||`/`!`, parentheses, string/number/bool literals.
  Example: `value.length >= 3 && value !== "admin"`.
- **Manual persistence.** Save/Load/Reset are explicit buttons (per the brief) rather than
  auto-persistence.

## JSON schema format

```jsonc
{
  "version": 1,
  "title": "Account Registration",
  "fields": [
    {
      "id": "f1",
      "type": "text",
      "name": "email",
      "label": "Email address",
      "required": true,
      "validation": {
        "required": true,
        "regex": { "pattern": "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", "message": "Enter a valid email" }
      }
    },
    {
      "id": "f2",
      "type": "select",
      "name": "country",
      "label": "Country",
      "options": [
        { "label": "United States", "value": "US" },
        { "label": "Canada", "value": "CA" }
      ]
    },
    {
      "id": "f3",
      "type": "text",
      "name": "state",
      "label": "State",
      "required": true,
      "visibleWhen": { "field": "country", "operator": "equals", "value": "US" }
    }
  ]
}
```

`operator` is one of `equals` · `notEquals` · `in` · `truthy`.

## Tests

`vitest` covers the pure logic — the highest-value, framework-independent code:

- `buildZodSchema.test.ts` — required/optional, min/max, regex, custom, number coercion,
  checkbox-required, and hidden-field exclusion.
- `visibility.test.ts` — every condition operator.
- `customRule.test.ts` — the DSL grammar and error handling.

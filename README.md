# Form Builder

**▶ Live demo: https://benepass-form-builder-mocha.vercel.app/** — nothing to install.

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
- **Validation** — per field: `required`, `min`/`max` (length or value), `regex`, and a curated set
  of named `custom` validators (email, URL, alphanumeric, …). Compiled to a
  [zod](https://zod.dev) schema at render time.
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
    formResolver.ts    # react-hook-form resolver built on buildZodSchema
    visibility.ts      # conditional-visibility evaluator
    customValidators.ts # curated named `custom` validators (email, url, ...)
    metaSchema.ts      # zod schema-of-the-schema; validates imported JSON
    storage.ts         # localStorage save/load/reset
    mockSubmit.ts      # latency + random success/failure
    fieldFactory.ts    # default field per type, unique-name helpers
  store/
    useBuilderStore.ts  # zustand: fields, selection, title; add/remove/move/update
  components/
    builder/   # FieldList + SortableFieldItem, PropertiesPanel, FieldRow,
               # ValidationEditor, ConditionalEditor, OptionsEditor, EmptyState,
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
- **Curated custom validators.** Rather than a free-text expression language, `custom` is a small
  fixed set of named validators (`customValidators.ts`) — email, URL, alphanumeric, no-whitespace,
  lowercase — each a one-line predicate compiled to a zod `.refine()`. Simpler, safer (no parser /
  no `eval`), and clearer to use; the author can override the default error message.
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
        "custom": { "kind": "email" }
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

`validation` accepts `required`, `min`, `max`, `regex: { pattern, message? }`, and
`custom: { kind, message? }` — where `kind` is one of `email` · `url` · `alphanumeric` ·
`no_whitespace` · `lowercase`.

## Tests

`vitest` covers the pure logic — the highest-value, framework-independent code (no component/render
tests; UI behavior is delegated to react-hook-form / Radix / dnd-kit):

- `buildZodSchema.test.ts` — required/optional, min/max, regex, custom, number coercion,
  checkbox-required, and hidden-field exclusion.
- `visibility.test.ts` — every condition operator.
- `formResolver.test.ts` — the RHF resolver: validation, error mapping, hidden-field exclusion.
- `metaSchema.test.ts` — import validation: strict keys, invalid regex, unknown custom validator,
  operator/value shape, duplicate names/ids, dangling visibility refs.
- `fieldFactory.test.ts` / `useBuilderStore.test.ts` — defaults, type reconciliation, and the
  store's rename/delete cascades into `visibleWhen`.
- `storage.test.ts` — localStorage round-trip and the empty / invalid / unavailable cases.

## Deployment

Deployed as a static SPA on **Vercel** (auto-detects Vite — build `npm run build`, output `dist`).
Pushes to `main` redeploy automatically; no server or config is required.

## Limitations & production considerations

Scoped to the brief's spirit — correctness, clarity, and tradeoffs over completeness. The notable
boundaries, and what I'd do with more time or to make this production-bound:

**Deliberate tradeoffs**

- **Logic-only tests.** Unit tests cover the pure logic — schema building, validation, visibility,
  the RHF resolver, import validation, and the store's rename/delete cascades — where the real risk
  lives; UI behavior leans on the already-tested libraries (react-hook-form, Radix, dnd-kit). The
  next tier would be a few Playwright end-to-end flows (build → preview → submit; import-invalid-JSON
  → error), not shallow component tests.
- **Two schema representations.** TS interfaces in `types.ts` (authoring ergonomics + JSDoc) and a
  zod meta-schema in `metaSchema.ts` (runtime import validation, including cross-field rules), kept
  in sync by hand. At scale I'd derive the leaf types via `z.infer` and keep only the cross-field
  `superRefine` separate.
- **Curated custom validators** rather than a free-text expression language: the spec only asks for
  "custom rules (using zod)", and a named list is simpler, safer (no parser / no `eval`), and clearer
  to use.
- **Explicit per-field-type components.** The seven field components share some boilerplate; explicit
  beats a premature abstraction at this size. A shared `<FieldControl>` + field registry earns its
  keep once the type list grows.

**Known limitations (next up)**

- **No schema migration path.** `version` is validated with `z.literal(1)`, so bumping it would
  hard-reject older saved/exported forms. Production needs `version` branching + a
  `migrate(old): FormSchema` step ahead of validation.
- **`min`/`max` covers text length and number value, not dates.** Date range (earliest/latest) is a
  natural follow-up.
- **`select`/`radio` values aren't constrained to their options at validation time** (the builder UI
  prevents bad input; imports are structurally validated). Would tighten to a `z.enum` built from the
  field's options.
- **Accessibility gaps.** Drag-to-reorder has no keyboard alternative (would add move up/down
  buttons), and a few brand-tuned colors fall just short of WCAG AA contrast.

**If this were production-bound ("ship it")**

- Replace `localStorage` + `mockSubmit` with a real API — the `FormSchema` JSON is already the
  contract, so this is mostly swapping the persistence/submission adapters.
- Add schema versioning + migrations, saved-forms management, and auth / multi-user.
- Broaden testing to Playwright e2e + targeted component tests; add error reporting / telemetry.
- Complete the accessibility pass to WCAG AA, and add i18n for labels and messages.

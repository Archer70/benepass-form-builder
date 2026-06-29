import type { FormSchema } from './types'
import { createSchema } from './types'

/**
 * A demonstrative schema for the "Load sample form" affordance. It exercises
 * every field type plus required / custom-email / min validation and a
 * conditional field (State shows only when Country is US), so a reviewer
 * opening the live demo cold can see the app's capabilities immediately
 * without building a form by hand. Returns a fresh object on each call.
 */
export function sampleSchema(): FormSchema {
  return createSchema('Account registration', [
    {
      id: 'sample-fullName',
      type: 'text',
      name: 'fullName',
      label: 'Full name',
      placeholder: 'Ada Lovelace',
      required: true,
    },
    {
      id: 'sample-email',
      type: 'text',
      name: 'email',
      label: 'Email address',
      placeholder: 'you@example.com',
      required: true,
      validation: { custom: { kind: 'email' } },
    },
    {
      id: 'sample-country',
      type: 'select',
      name: 'country',
      label: 'Country',
      required: true,
      options: [
        { label: 'United States', value: 'US' },
        { label: 'Canada', value: 'CA' },
        { label: 'United Kingdom', value: 'UK' },
      ],
    },
    {
      id: 'sample-state',
      type: 'text',
      name: 'state',
      label: 'State',
      placeholder: 'California',
      required: true,
      helpText: 'Only required for US addresses.',
      visibleWhen: { field: 'country', operator: 'equals', value: 'US' },
    },
    {
      id: 'sample-age',
      type: 'number',
      name: 'age',
      label: 'Age',
      helpText: 'Must be 18 or older.',
      validation: { min: 18 },
    },
    {
      id: 'sample-plan',
      type: 'radio',
      name: 'plan',
      label: 'Plan',
      defaultValue: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
      ],
    },
    {
      id: 'sample-startDate',
      type: 'date',
      name: 'startDate',
      label: 'Start date',
    },
    {
      id: 'sample-notes',
      type: 'textarea',
      name: 'notes',
      label: 'Anything else?',
      placeholder: 'Optional notes…',
    },
    {
      id: 'sample-terms',
      type: 'checkbox',
      name: 'terms',
      label: 'I accept the terms of service',
      required: true,
    },
  ])
}

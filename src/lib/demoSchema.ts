import type { FormSchema } from './types'

/**
 * A non-trivial starter schema so the app shows a working form on first load.
 * Exercises every field type plus a conditional (`state` shows when US) and a
 * spread of validation rules (required, regex, min/max, custom).
 */
export const demoSchema: FormSchema = {
  version: 1,
  title: 'Account Registration',
  fields: [
    {
      id: 'demo-full-name',
      type: 'text',
      name: 'full_name',
      label: 'Full name',
      placeholder: 'Jane Doe',
      helpText: 'As it appears on official documents.',
      required: true,
      validation: { required: true, min: 2, max: 60 },
    },
    {
      id: 'demo-email',
      type: 'text',
      name: 'email',
      label: 'Email address',
      placeholder: 'jane@example.com',
      required: true,
      validation: {
        required: true,
        regex: {
          pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
          message: 'Enter a valid email address',
        },
      },
    },
    {
      id: 'demo-age',
      type: 'number',
      name: 'age',
      label: 'Age',
      placeholder: '18',
      helpText: 'You must be at least 18.',
      required: true,
      validation: { required: true, min: 18, max: 120 },
    },
    {
      id: 'demo-country',
      type: 'select',
      name: 'country',
      label: 'Country',
      required: true,
      validation: { required: true },
      options: [
        { label: 'United States', value: 'US' },
        { label: 'Canada', value: 'CA' },
        { label: 'United Kingdom', value: 'UK' },
      ],
    },
    {
      id: 'demo-state',
      type: 'text',
      name: 'state',
      label: 'State',
      placeholder: 'California',
      helpText: 'Required for US residents.',
      required: true,
      validation: { required: true },
      visibleWhen: { field: 'country', operator: 'equals', value: 'US' },
    },
    {
      id: 'demo-contact',
      type: 'radio',
      name: 'contact_method',
      label: 'Preferred contact method',
      options: [
        { label: 'Email', value: 'email' },
        { label: 'Phone', value: 'phone' },
      ],
      defaultValue: 'email',
    },
    {
      id: 'demo-bio',
      type: 'textarea',
      name: 'bio',
      label: 'Short bio',
      placeholder: 'Tell us a little about yourself…',
      helpText: 'Optional. Max 200 characters.',
      validation: { max: 200 },
    },
    {
      id: 'demo-start',
      type: 'date',
      name: 'start_date',
      label: 'Preferred start date',
      required: true,
      validation: { required: true },
    },
    {
      id: 'demo-subscribe',
      type: 'checkbox',
      name: 'subscribe',
      label: 'Subscribe to the newsletter',
      defaultValue: false,
    },
    {
      id: 'demo-terms',
      type: 'checkbox',
      name: 'accept_terms',
      label: 'I accept the terms and conditions',
      required: true,
      validation: { required: true },
    },
  ],
}

export function emptySchema(): FormSchema {
  return { version: 1, title: 'Untitled form', fields: [] }
}

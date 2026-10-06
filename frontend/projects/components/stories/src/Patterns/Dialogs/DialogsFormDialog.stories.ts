import type { StoryObj } from '@storybook/angular';

import type { LinkContactData } from './dialogs';

const linkContact: LinkContactData = { partner: 'Kensington Community Kitchen', query: 'Am' };

export const FormDialog: StoryObj = {
  name: 'Form dialog',
  render: () => ({
    props: { linkContact },
    template: `
      <story-dialog-stage
        eyebrow="Partners"
        pageTitle="Kensington Community Kitchen"
        subtitle="Food security · 6 linked contacts"
        triggerLabel="Link contact"
        triggerIcon="person_add"
        [linkContact]="linkContact"
      />
    `,
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'Button-triggered editing opens a dialog, never an inline form. `MatDialog.open()` hosts a small form: `tar-search-field` with a `tar-list` of matches, a `tar-text-field`, and `tar-form-actions` in `mat-dialog-actions`. "Link contact" stays disabled until a match is picked; Cancel and Escape close with no result.',
      },
    },
  },
};

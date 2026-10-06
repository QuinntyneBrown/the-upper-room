import type { StoryObj } from '@storybook/angular';

import type { ConfirmOptions } from 'components';

const confirm: ConfirmOptions = {
  title: 'Delete Ama Mensah?',
  body: 'This permanently removes the contact, their notes and their links to 2 partners. It cannot be undone. To hide them instead, archive the contact.',
  severity: 'danger',
  confirmLabel: 'Delete contact',
};

export const DestructiveDelete: StoryObj = {
  name: 'Destructive delete',
  render: () => ({
    props: { confirm },
    template: `
      <story-dialog-stage
        eyebrow="Contacts"
        pageTitle="Ama Mensah"
        subtitle="Volunteer coordinator @ Daily Bread Food Bank"
        triggerLabel="Delete"
        triggerIcon="delete"
        [confirm]="confirm"
      />
    `,
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          "`ConfirmService.confirm({ severity: 'danger' })` opens `tar-confirm-dialog` in a CDK overlay and resolves `true` only on the confirm button. The title names the thing being deleted, the body says what else goes with it and offers the reversible alternative, and the confirm label repeats the verb. Focus starts on Cancel (`confirm-cancel`).",
      },
    },
  },
};

import type { StoryObj } from '@storybook/angular';

import type { ConfirmOptions } from 'components';

const confirm: ConfirmOptions = {
  title: 'Delete the Winter coat drive board?',
  body: 'All 4 columns and 23 cards, including their comments and attachments, will be deleted for everyone in Toronto.',
  severity: 'danger',
  confirmLabel: 'Delete board',
  requireTypedConfirmation: 'Winter coat drive',
};

export const TypedConfirmation: StoryObj = {
  name: 'Typed confirmation',
  render: () => ({
    props: { confirm },
    template: `
      <story-dialog-stage
        eyebrow="Kanban Boards"
        pageTitle="Winter coat drive"
        subtitle="Collecting and sorting coats for the December giveaway."
        triggerLabel="Delete board"
        triggerIcon="delete_forever"
        [confirm]="confirm"
      />
    `,
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'For deletions that take a lot of shared work with them, `requireTypedConfirmation` adds a field (`confirm-typed-input`) and keeps the confirm button disabled until the exact phrase, here the board name, is typed.',
      },
    },
  },
};

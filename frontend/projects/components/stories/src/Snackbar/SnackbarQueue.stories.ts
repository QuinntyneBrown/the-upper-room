import type { StoryObj } from '@storybook/angular';

import type { TarSnackbar } from 'components';

export const Queue: StoryObj<TarSnackbar> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        <story-snackbar-trigger message="Imported 48 contacts" severity="success">Import contacts</story-snackbar-trigger>
        <story-snackbar-trigger message="3 contacts were skipped as duplicates" severity="warning">
          Report duplicates
        </story-snackbar-trigger>
        <story-snackbar-trigger message="Contacts list refreshed">Refresh list</story-snackbar-trigger>
      </div>
      <tar-snackbar />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Click several buttons quickly: `SnackbarService` queues messages and shows one at a time, in order. Hovering or focusing the snackbar pauses its timer; leaving resumes it.',
      },
    },
  },
};

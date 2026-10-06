import type { StoryObj } from '@storybook/angular';

import type { TarSnackbar } from 'components';

export const Severities: StoryObj<TarSnackbar> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        <story-snackbar-trigger message="Board link copied" severity="info">Info</story-snackbar-trigger>
        <story-snackbar-trigger message="Partner added to Ottawa" severity="success">Success</story-snackbar-trigger>
        <story-snackbar-trigger message="Event starts in 30 minutes and has no location" severity="warning">
          Warning
        </story-snackbar-trigger>
        <story-snackbar-trigger message="Couldn't save the idea. Check your connection." severity="error">
          Error
        </story-snackbar-trigger>
      </div>
      <tar-snackbar />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Each severity sets `.tar-snackbar--{severity}` and an auto-dismiss time: `info` 4 s, `success` 5 s, `warning` 7 s. `error` stays until dismissed and is announced with `role="alert"` (the others use `role="status"`).',
      },
    },
  },
};

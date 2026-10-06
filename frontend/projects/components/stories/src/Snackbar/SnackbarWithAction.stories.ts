import type { StoryObj } from '@storybook/angular';

import type { TarSnackbar } from 'components';

export const WithAction: StoryObj<TarSnackbar> = {
  render: () => ({
    template: `
      <story-snackbar-trigger
        message="Partner archived"
        actionLabel="Undo"
        actionResult="Partner restored"
        variant="outlined"
      >
        Archive partner
      </story-snackbar-trigger>
      <tar-snackbar />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Pass a `SnackbarAction { label, onClick }` as the third argument to `show()`. The action renders as a text button (`snackbar-action`); clicking it dismisses the snackbar and then runs `onClick` — here, a follow-up "Partner restored".',
      },
    },
  },
};

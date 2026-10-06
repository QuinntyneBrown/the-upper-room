import type { StoryObj } from '@storybook/angular';

import type { TarSnackbar } from 'components';

export const Shown: StoryObj<TarSnackbar> = {
  render: () => ({
    template: `
      <div style="min-height: 160px">
        <story-snackbar-trigger
          message="Couldn't move the card to Done. The board was changed by someone else."
          severity="error"
          actionLabel="Reload"
          actionResult="Board reloaded"
          testId="show-error"
        >
          Move card
        </story-snackbar-trigger>
      </div>
      <tar-snackbar />
    `,
  }),
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('[data-testid="show-error"]')?.click();
  },
  parameters: {
    docs: {
      description: {
        story:
          'An `error` snackbar with an action, opened on load (in the story view) so the rendered state can be inspected. It stays until "Reload" or the close button is pressed.',
      },
    },
  },
};

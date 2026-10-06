import type { StoryObj } from '@storybook/angular';

import type { TarButton } from 'components';

export const FullWidth: StoryObj<TarButton> = {
  render: () => ({
    template: `
      <div style="max-width: 360px; display: grid; gap: 12px">
        <tar-button [fullWidth]="true" type="submit">Sign in</tar-button>
        <tar-button [fullWidth]="true" variant="text">Forgot password?</tar-button>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: '`fullWidth` adds `.tar-button--full-width` and stretches to the container — the sign-in card and phone layouts.',
      },
    },
  },
};

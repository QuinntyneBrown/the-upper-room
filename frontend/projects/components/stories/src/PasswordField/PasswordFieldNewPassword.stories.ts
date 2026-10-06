import type { StoryObj } from '@storybook/angular';

import type { TarPasswordField } from 'components';

export const NewPassword: StoryObj<TarPasswordField> = {
  render: () => ({
    template: `
      <div style="max-width: 360px">
        <tar-password-field label="New password" autocomplete="new-password" value="harbour-lights-2026" hint="At least 12 characters." />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Setting a password: `autocomplete="new-password"` and the rules in `hint`. Use the eye button to reveal the value.',
      },
    },
  },
};

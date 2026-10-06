import type { StoryObj } from '@storybook/angular';

import type { TarPasswordStrength } from 'components';

export const ContainsEmail: StoryObj<TarPasswordStrength> = {
  render: () => ({
    template: `
      <div style="max-width: 360px">
        <tar-password-strength password="Jordan.Reyes-2026" userEmail="jordan.reyes@upperroom.org" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'When `userEmail` is set and the password contains its local part (3+ characters), the score drops by two and the password is never valid.',
      },
    },
  },
};

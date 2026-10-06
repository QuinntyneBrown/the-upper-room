import type { StoryObj } from '@storybook/angular';

import type { TarPasswordStrength } from 'components';

export const CommonPassword: StoryObj<TarPasswordStrength> = {
  render: () => ({
    template: `
      <div style="max-width: 360px">
        <tar-password-strength password="Password1!" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Passwords on the built-in common-password list score 0 regardless of the rules they meet, and the helper asks for a stronger password.',
      },
    },
  },
};

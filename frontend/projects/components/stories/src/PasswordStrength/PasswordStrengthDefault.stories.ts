import type { StoryObj } from '@storybook/angular';

import type { TarPasswordStrength } from 'components';

export const Default: StoryObj<TarPasswordStrength> = {
  args: {
    password: 'Harbourfront2026',
    userEmail: 'maya.okafor@upperroom.org',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 360px">
        <tar-password-strength [password]="password" [userEmail]="userEmail" />
      </div>
    `,
  }),
};

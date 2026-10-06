import type { StoryObj } from '@storybook/angular';

import type { TarAvatar } from 'components';

export const Sizes: StoryObj<TarAvatar> = {
  render: () => ({
    props: { user: { displayName: 'Jordan Reyes', email: 'jordan.reyes@upperroom.org' } },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center">
        <tar-avatar [user]="user" [size]="24" />
        <tar-avatar [user]="user" [size]="32" />
        <tar-avatar [user]="user" [size]="40" />
        <tar-avatar [user]="user" [size]="48" />
        <tar-avatar [user]="user" [size]="64" />
        <tar-avatar [user]="user" [size]="96" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`size` is one of 24, 32, 40, 48 (default), 64 or 96 px. Initials scale to 40% of the size.',
      },
    },
  },
};

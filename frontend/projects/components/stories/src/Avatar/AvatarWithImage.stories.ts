import type { StoryObj } from '@storybook/angular';

import type { TarAvatar } from 'components';

import { samplePhotoUrl } from './avatar-photo';

export const WithImage: StoryObj<TarAvatar> = {
  render: () => ({
    props: {
      user: {
        displayName: 'Daniel Mensah',
        email: 'daniel.mensah@upperroom.org',
        avatarUrl: samplePhotoUrl,
      },
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center">
        <tar-avatar [user]="user" [size]="40" />
        <tar-avatar [user]="user" [size]="64" />
        <tar-avatar [user]="user" [size]="96" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'When `user.avatarUrl` is set the avatar renders `.avatar--image` (`data-testid="avatar-image"`), cropped to a circle with `object-fit: cover`.',
      },
    },
  },
};

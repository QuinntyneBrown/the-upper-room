import type { StoryObj } from '@storybook/angular';

import type { TarAvatarUploader } from 'components';

import { samplePhotoUrl } from '../Avatar/avatar-photo';

export const WithImage: StoryObj<TarAvatarUploader> = {
  render: () => ({
    props: {
      user: {
        displayName: 'Daniel Mensah',
        email: 'daniel.mensah@upperroom.org',
        avatarUrl: samplePhotoUrl,
      },
    },
    template: `<tar-avatar-uploader [user]="user" />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'With an existing `avatarUrl` the current photo is shown above the "Change avatar" call to action.',
      },
    },
  },
};

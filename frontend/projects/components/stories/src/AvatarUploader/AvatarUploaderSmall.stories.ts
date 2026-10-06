import type { StoryObj } from '@storybook/angular';

import type { TarAvatarUploader } from 'components';

export const Small: StoryObj<TarAvatarUploader> = {
  render: () => ({
    props: { user: { displayName: 'Lucía Herrera', email: 'lucia.herrera@upperroom.org' } },
    template: `<tar-avatar-uploader [user]="user" [size]="64" />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`size` is passed through to the inner `tar-avatar`; 96 px is the default for profile pages, 64 px suits settings panels.',
      },
    },
  },
};

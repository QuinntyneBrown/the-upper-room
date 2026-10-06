import type { StoryObj } from '@storybook/angular';

import type { TarAvatarUploader } from 'components';

export const Default: StoryObj<TarAvatarUploader> = {
  args: {
    user: { displayName: 'Priya Nair', email: 'priya.nair@upperroom.org', avatarUrl: null },
    size: 96,
  },
  argTypes: {
    size: { control: 'select', options: [24, 32, 40, 48, 64, 96] },
    fileSelected: { action: 'fileSelected' },
  },
  render: (args) => ({
    props: args,
    template: `<tar-avatar-uploader [user]="user" [size]="size" (fileSelected)="fileSelected($event)" />`,
  }),
};

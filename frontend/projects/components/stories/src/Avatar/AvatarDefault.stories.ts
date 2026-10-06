import type { StoryObj } from '@storybook/angular';

import type { TarAvatar } from 'components';

export const Default: StoryObj<TarAvatar> = {
  args: {
    user: { displayName: 'Maya Okafor', email: 'maya.okafor@upperroom.org', avatarUrl: null },
    size: 48,
  },
  argTypes: {
    size: { control: 'select', options: [24, 32, 40, 48, 64, 96] },
  },
  render: (args) => ({
    props: args,
    template: `<tar-avatar [user]="user" [size]="size" />`,
  }),
};

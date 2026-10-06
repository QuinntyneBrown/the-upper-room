import type { StoryObj } from '@storybook/angular';

import type { TarIcon } from 'components';

export const Default: StoryObj<TarIcon> = {
  args: { name: 'contacts', size: 'md' },
  render: (args) => ({
    props: args,
    template: `<tar-icon [name]="name" [size]="size" />`,
  }),
};

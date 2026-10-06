import type { StoryObj } from '@storybook/angular';

import type { TarSkeleton } from 'components';

export const Default: StoryObj<TarSkeleton> = {
  args: {
    rowCount: 5,
    rowHeight: 56,
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 560px"><tar-skeleton [rowCount]="rowCount" [rowHeight]="rowHeight" /></div>`,
  }),
};

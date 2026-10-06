import type { StoryObj } from '@storybook/angular';

import type { TarListError } from 'components';

export const Default: StoryObj<TarListError> = {
  args: {
    correlationId: '0HN7Q2K8C1V3F:00000004',
  },
  render: (args) => ({
    props: args,
    template: `<tar-list-error [correlationId]="correlationId" />`,
  }),
};

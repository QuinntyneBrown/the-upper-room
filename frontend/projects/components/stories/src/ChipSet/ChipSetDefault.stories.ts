import type { StoryObj } from '@storybook/angular';

import type { TarChipSet } from 'components';

export const Default: StoryObj<TarChipSet> = {
  args: {
    single: true,
    value: 'toronto',
    options: [
      { value: 'toronto', label: 'Toronto' },
      { value: 'ottawa', label: 'Ottawa' },
      { value: 'montreal', label: 'Montréal' },
      { value: 'vancouver', label: 'Vancouver' },
    ],
    ariaLabel: 'City',
    testId: 'city-chips',
  },
  render: (args) => ({
    props: args,
    template: `<tar-chip-set [single]="single" [value]="value" [options]="options" [ariaLabel]="ariaLabel" [testId]="testId" />`,
  }),
};

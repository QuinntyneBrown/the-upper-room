import type { StoryObj } from '@storybook/angular';

import type { TarProgressSpinner } from 'components';

export const Default: StoryObj<TarProgressSpinner> = {
  args: {
    mode: 'indeterminate',
    value: 0,
    diameter: 40,
    strokeWidth: 4,
    ariaLabel: 'Loading partners',
    testId: 'partners-spinner',
  },
  argTypes: {
    mode: { control: 'select', options: ['determinate', 'indeterminate'] },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    diameter: { control: { type: 'range', min: 16, max: 96, step: 4 } },
    strokeWidth: { control: { type: 'range', min: 1, max: 10, step: 1 } },
  },
  render: (args) => ({
    props: args,
    template: `<tar-progress-spinner [mode]="mode" [value]="value" [diameter]="diameter" [strokeWidth]="strokeWidth" [ariaLabel]="ariaLabel" [testId]="testId" />`,
  }),
};

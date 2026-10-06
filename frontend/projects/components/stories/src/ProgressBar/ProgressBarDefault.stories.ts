import type { StoryObj } from '@storybook/angular';

import type { TarProgressBar } from 'components';

export const Default: StoryObj<TarProgressBar> = {
  args: {
    mode: 'determinate',
    value: 40,
    bufferValue: 0,
    ariaLabel: 'Importing contacts',
    testId: 'contacts-import-progress',
  },
  argTypes: {
    mode: { control: 'select', options: ['determinate', 'indeterminate', 'buffer', 'query'] },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    bufferValue: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
  render: (args) => ({
    props: args,
    template: `<tar-progress-bar [mode]="mode" [value]="value" [bufferValue]="bufferValue" [ariaLabel]="ariaLabel" [testId]="testId" />`,
  }),
};

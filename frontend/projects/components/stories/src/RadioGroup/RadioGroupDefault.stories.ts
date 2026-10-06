import type { StoryObj } from '@storybook/angular';

import type { TarRadioGroup } from 'components';

export const Default: StoryObj<TarRadioGroup> = {
  args: {
    label: 'Preferred contact method',
    value: 'email',
    options: [
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'text', label: 'Text message' },
    ],
    inline: false,
    disabled: false,
    ariaLabel: null,
    testId: 'contact-method',
  },
  render: (args) => ({
    props: args,
    template: `<tar-radio-group [label]="label" [value]="value" [options]="options" [inline]="inline" [disabled]="disabled" [ariaLabel]="ariaLabel" [testId]="testId" />`,
  }),
};

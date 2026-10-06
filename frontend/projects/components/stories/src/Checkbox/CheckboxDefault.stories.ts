import type { StoryObj } from '@storybook/angular';

import type { TarCheckbox } from 'components';

export const Default: StoryObj<TarCheckbox> = {
  args: {
    checked: true,
    disabled: false,
    indeterminate: false,
    required: false,
    ariaLabel: null,
    testId: 'contact-newsletter',
  },
  render: (args) => ({
    props: args,
    template: `<tar-checkbox [checked]="checked" [disabled]="disabled" [indeterminate]="indeterminate" [required]="required" [ariaLabel]="ariaLabel" [testId]="testId">Subscribe to the monthly partner newsletter</tar-checkbox>`,
  }),
};

import type { StoryObj } from '@storybook/angular';

import type { TarSelect } from 'components';

export const Default: StoryObj<TarSelect> = {
  args: {
    label: 'City',
    value: 'toronto',
    options: [
      { value: 'toronto', label: 'Toronto' },
      { value: 'ottawa', label: 'Ottawa' },
      { value: 'montreal', label: 'Montréal' },
      { value: 'halifax', label: 'Halifax', disabled: true },
    ],
    placeholder: '',
    hint: null,
    error: null,
    ariaLabel: null,
    required: false,
    disabled: false,
    fullWidth: true,
    testId: 'event-city',
    errorTestId: null,
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 360px"><tar-select [label]="label" [value]="value" [options]="options" [placeholder]="placeholder" [hint]="hint" [error]="error" [ariaLabel]="ariaLabel" [required]="required" [disabled]="disabled" [fullWidth]="fullWidth" [testId]="testId" [errorTestId]="errorTestId" /></div>`,
  }),
};

import type { StoryObj } from '@storybook/angular';

import type { TarTextarea } from 'components';

export const Default: StoryObj<TarTextarea> = {
  args: {
    label: 'Notes',
    value:
      'Met Maya at the Riverside volunteer fair. Interested in running a monthly pantry shift.',
    placeholder: '',
    hint: null,
    error: null,
    ariaLabel: null,
    rows: 4,
    maxLength: null,
    required: false,
    disabled: false,
    fullWidth: true,
    testId: 'contact-notes',
    errorTestId: null,
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 480px"><tar-textarea [label]="label" [value]="value" [placeholder]="placeholder" [hint]="hint" [error]="error" [ariaLabel]="ariaLabel" [rows]="rows" [maxLength]="maxLength" [required]="required" [disabled]="disabled" [fullWidth]="fullWidth" [testId]="testId" [errorTestId]="errorTestId" /></div>`,
  }),
};

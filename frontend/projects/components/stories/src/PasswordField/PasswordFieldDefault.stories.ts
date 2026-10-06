import type { StoryObj } from '@storybook/angular';

import type { TarPasswordField } from 'components';

export const Default: StoryObj<TarPasswordField> = {
  args: {
    label: 'Password',
    value: '',
    placeholder: '',
    hint: null,
    error: null,
    ariaLabel: null,
    autocomplete: 'current-password',
    maxLength: null,
    required: true,
    disabled: false,
    fullWidth: true,
    testId: 'sign-in-password',
    errorTestId: null,
    toggleTestId: null,
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 360px"><tar-password-field [label]="label" [value]="value" [placeholder]="placeholder" [hint]="hint" [error]="error" [ariaLabel]="ariaLabel" [autocomplete]="autocomplete" [maxLength]="maxLength" [required]="required" [disabled]="disabled" [fullWidth]="fullWidth" [testId]="testId" [errorTestId]="errorTestId" [toggleTestId]="toggleTestId" /></div>`,
  }),
};

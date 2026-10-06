import type { StoryObj } from '@storybook/angular';

import type { TarTextField } from 'components';

export const Default: StoryObj<TarTextField> = {
  args: {
    label: 'Email',
    value: 'maya.chen@riversidefoodbank.org',
    type: 'email',
    placeholder: '',
    hint: 'We send event reminders here.',
    error: null,
    ariaLabel: null,
    autocomplete: 'email',
    inputmode: null,
    maxLength: null,
    prefixIcon: null,
    suffixIcon: null,
    appearance: 'outline',
    required: false,
    readonly: false,
    disabled: false,
    fullWidth: true,
    hideRequiredMarker: false,
    testId: 'contact-email',
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 420px"><tar-text-field [label]="label" [value]="value" [type]="type" [placeholder]="placeholder" [hint]="hint" [error]="error" [ariaLabel]="ariaLabel" [autocomplete]="autocomplete" [inputmode]="inputmode" [maxLength]="maxLength" [prefixIcon]="prefixIcon" [suffixIcon]="suffixIcon" [appearance]="appearance" [required]="required" [readonly]="readonly" [disabled]="disabled" [fullWidth]="fullWidth" [hideRequiredMarker]="hideRequiredMarker" [testId]="testId" /></div>`,
  }),
};

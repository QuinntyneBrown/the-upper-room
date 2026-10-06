import type { StoryObj } from '@storybook/angular';

import type { TarSearchField } from 'components';

export const Default: StoryObj<TarSearchField> = {
  args: {
    label: null,
    value: '',
    placeholder: 'Search contacts by name or email',
    ariaLabel: null,
    disabled: false,
    autocomplete: 'off',
    testId: 'contacts-search',
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 480px"><tar-search-field [label]="label" [value]="value" [placeholder]="placeholder" [ariaLabel]="ariaLabel" [disabled]="disabled" [autocomplete]="autocomplete" [testId]="testId" /></div>`,
  }),
};

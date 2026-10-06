import type { StoryObj } from '@storybook/angular';

import type { TarToggle } from 'components';

export const Default: StoryObj<TarToggle> = {
  args: { checked: false, disabled: false, ariaLabel: null, testId: 'partners-show-archived' },
  render: (args) => ({
    props: args,
    template: `<tar-toggle [checked]="checked" [disabled]="disabled" [ariaLabel]="ariaLabel" [testId]="testId">Show archived partners</tar-toggle>`,
  }),
};

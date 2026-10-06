import type { StoryObj } from '@storybook/angular';

import type { TarFab } from 'components';

export const Default: StoryObj<TarFab> = {
  args: {
    icon: 'add',
    ariaLabel: 'New idea',
    extended: false,
    type: 'button',
    disabled: false,
    testId: 'ideas-new',
  },
  render: (args) => ({
    props: args,
    template: `<tar-fab [icon]="icon" [ariaLabel]="ariaLabel" [extended]="extended" [type]="type" [disabled]="disabled" [testId]="testId">New idea</tar-fab>`,
  }),
};

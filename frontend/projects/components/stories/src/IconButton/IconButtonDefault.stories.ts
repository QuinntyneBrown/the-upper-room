import type { StoryObj } from '@storybook/angular';

import type { TarIconButton } from 'components';

export const Default: StoryObj<TarIconButton> = {
  args: {
    icon: 'more_vert',
    ariaLabel: 'More actions for Riverside Food Bank',
    type: 'button',
    disabled: false,
    testId: 'partner-row-menu',
  },
  render: (args) => ({
    props: args,
    template: `<tar-icon-button [icon]="icon" [ariaLabel]="ariaLabel" [type]="type" [disabled]="disabled" [testId]="testId" />`,
  }),
};

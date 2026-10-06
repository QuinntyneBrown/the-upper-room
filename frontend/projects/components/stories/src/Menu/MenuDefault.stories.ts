import type { StoryObj } from '@storybook/angular';

import type { TarMenu } from 'components';

export const Default: StoryObj<TarMenu> = {
  args: {
    items: [
      { id: 'edit', label: 'Edit contact', icon: 'edit' },
      { id: 'email', label: 'Send email', icon: 'mail' },
      { id: 'divider', label: '', divider: true },
      { id: 'archive', label: 'Archive', icon: 'archive', danger: true },
    ],
    triggerIcon: 'more_vert',
    ariaLabel: 'Contact actions',
    xPosition: 'after',
    yPosition: 'below',
    testId: 'contact-menu',
  },
  argTypes: {
    xPosition: { control: 'inline-radio', options: ['before', 'after'] },
    yPosition: { control: 'inline-radio', options: ['above', 'below'] },
  },
  render: (args) => ({
    props: args,
    template: `<tar-menu [items]="items" [triggerIcon]="triggerIcon" [ariaLabel]="ariaLabel" [xPosition]="xPosition" [yPosition]="yPosition" [testId]="testId" />`,
  }),
};

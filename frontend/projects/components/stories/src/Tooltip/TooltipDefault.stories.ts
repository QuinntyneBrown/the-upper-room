import type { StoryObj } from '@storybook/angular';

interface TooltipArgs {
  message: string;
  position: 'left' | 'right' | 'above' | 'below' | 'before' | 'after';
  disabled: boolean;
  showDelay: number;
  hideDelay: number;
}

export const Default: StoryObj<TooltipArgs> = {
  args: {
    message: 'Archive partner',
    position: 'below',
    disabled: false,
    showDelay: 0,
    hideDelay: 0,
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['left', 'right', 'above', 'below', 'before', 'after'],
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 48px">
        <tar-icon-button
          icon="archive"
          ariaLabel="Archive partner"
          [tarTooltip]="message"
          [tarTooltipPosition]="position"
          [tarTooltipDisabled]="disabled"
          [tarTooltipShowDelay]="showDelay"
          [tarTooltipHideDelay]="hideDelay"
        />
      </div>
    `,
  }),
};

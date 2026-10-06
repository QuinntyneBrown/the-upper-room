import type { StoryObj } from '@storybook/angular';

interface BadgeArgs {
  content: string;
  position: 'above after' | 'above before' | 'below before' | 'below after';
  size: 'small' | 'medium' | 'large';
  overlap: boolean;
  hidden: boolean;
}

export const Default: StoryObj<BadgeArgs> = {
  args: {
    content: '3',
    position: 'above after',
    size: 'medium',
    overlap: true,
    hidden: false,
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['above after', 'above before', 'below before', 'below after'],
    },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 16px">
        <tar-icon-button
          icon="notifications"
          ariaLabel="Notifications, {{ content }} unread"
          [tarBadge]="content"
          [tarBadgePosition]="position"
          [tarBadgeSize]="size"
          [tarBadgeOverlap]="overlap"
          [tarBadgeHidden]="hidden"
        />
      </div>
    `,
  }),
};

import type { StoryObj } from '@storybook/angular';

interface SnackbarArgs {
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  actionLabel: string | null;
}

export const Default: StoryObj<SnackbarArgs> = {
  args: {
    message: 'Contact saved',
    severity: 'success',
    actionLabel: null,
  },
  argTypes: {
    severity: { control: 'inline-radio', options: ['info', 'success', 'warning', 'error'] },
  },
  render: (args) => ({
    props: args,
    template: `
      <story-snackbar-trigger [message]="message" [severity]="severity" [actionLabel]="actionLabel" variant="filled">
        Show snackbar
      </story-snackbar-trigger>
      <tar-snackbar />
    `,
  }),
};

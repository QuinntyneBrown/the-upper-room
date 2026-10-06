import type { StoryObj } from '@storybook/angular';

import { AUTH_FORM, AUTH_LINK, AUTH_TEXT, AUTH_TITLE, authPage } from './auth';

export const ForgotPassword: StoryObj = {
  name: 'Forgot password, link sent',
  render: () => ({
    template: authPage(`
      <form style="${AUTH_FORM}" novalidate (submit)="$event.preventDefault()">
        <h1 style="${AUTH_TITLE}">Reset your password</h1>
        <p style="${AUTH_TEXT}">Enter the email you sign in with and we'll send you a reset link.</p>
        <tar-banner
          severity="success"
          icon="mark_email_read"
          message="If an account exists for sofia.alvarez@stlawrencehall.ca, a reset link is on its way."
          [dismissible]="false"
        />
        <tar-text-field label="Email" type="email" autocomplete="email" value="sofia.alvarez@stlawrencehall.ca" />
        <tar-button type="submit" variant="outlined" [fullWidth]="true">Send again</tar-button>
        <p style="${AUTH_TEXT}"><a routerLink="/sign-in" style="${AUTH_LINK}">Back to sign in</a></p>
      </form>
    `),
  }),
  parameters: {
    docs: {
      description: {
        story:
          'After "Send reset link" the card confirms with a `tar-banner severity="success"` (`role="status"`) whose wording never reveals whether the account exists. The primary demotes to an outlined "Send again".',
      },
    },
  },
};

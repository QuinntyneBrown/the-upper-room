import type { StoryObj } from '@storybook/angular';

import { AUTH_FORM, AUTH_LINK, AUTH_LINKS, AUTH_TITLE, authPage } from './auth';

export const SignInError: StoryObj = {
  name: 'Sign in, errors',
  render: () => ({
    template: authPage(`
      <form data-testid="sign-in-card" style="${AUTH_FORM}" novalidate aria-labelledby="sign-in-title" (submit)="$event.preventDefault()">
        <h1 id="sign-in-title" style="${AUTH_TITLE}">Sign in</h1>
        <tar-banner
          severity="error"
          icon="error"
          testId="sign-in-error-form"
          message="That email and password don't match. Check them and try again."
          [dismissible]="false"
        />
        <tar-text-field label="Email" type="email" autocomplete="email" testId="sign-in-email" value="ama.mensah@dailybread" error="Enter a valid email address." errorTestId="sign-in-error-email" />
        <tar-password-field label="Password" autocomplete="current-password" testId="sign-in-password" value="breakfastclub" />
        <tar-button type="submit" testId="sign-in-submit" [fullWidth]="true">Sign in</tar-button>
        <div style="${AUTH_LINKS}">
          <a routerLink="/forgot-password" style="${AUTH_LINK}">Forgot password?</a>
          <a routerLink="/sign-up" style="${AUTH_LINK}">Create account</a>
        </div>
      </form>
    `),
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Two kinds of error. A server rejection goes in a non-dismissible `tar-banner severity="error"` above the fields (`role="alert"`, so it is announced) and never says which credential was wrong. Field validation uses the field\'s own `error` input, rendered as `.tar-text-field__error` under the input.',
      },
    },
  },
};

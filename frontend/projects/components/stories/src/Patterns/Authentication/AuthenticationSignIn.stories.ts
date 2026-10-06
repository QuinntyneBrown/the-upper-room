import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import { AUTH_FORM, AUTH_LINK, AUTH_LINKS, AUTH_TITLE, authPage } from './auth';

export const SignIn: StoryObj = {
  name: 'Sign in',
  render: () => ({
    props: { email: signal(''), password: signal('') },
    template: authPage(`
      <form data-testid="sign-in-card" style="${AUTH_FORM}" novalidate aria-labelledby="sign-in-title" (submit)="$event.preventDefault()">
        <h1 id="sign-in-title" style="${AUTH_TITLE}">Sign in</h1>
        <tar-text-field label="Email" type="email" autocomplete="email" testId="sign-in-email" [value]="email()" (valueChange)="email.set($event)" />
        <tar-password-field label="Password" autocomplete="current-password" testId="sign-in-password" toggleTestId="sign-in-toggle-visibility" [value]="password()" (valueChange)="password.set($event)" />
        <tar-button type="submit" testId="sign-in-submit" [fullWidth]="true">Sign in</tar-button>
        <div style="${AUTH_LINKS}">
          <a data-testid="sign-in-forgot" routerLink="/forgot-password" style="${AUTH_LINK}">Forgot password?</a>
          <a data-testid="sign-in-signup" routerLink="/sign-up" style="${AUTH_LINK}">Create account</a>
        </div>
      </form>
    `),
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The `/sign-in` card: email `tar-text-field`, `tar-password-field` with its show/hide toggle, one full-width filled `tar-button type="submit"`, then links to the two neighbouring tasks.',
      },
    },
  },
};

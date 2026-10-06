import { computed, signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import { evaluatePassword } from 'components';

import { AUTH_FORM, AUTH_LINK, AUTH_TEXT, AUTH_TITLE, authPage } from './auth';

export const CreateAccount: StoryObj = {
  name: 'Create account',
  render: () => {
    const email = signal('priya.raman@tdsb.on.ca');
    const password = signal('Saturday2026');
    const termsAccepted = signal(false);
    return {
      props: {
        email,
        password,
        termsAccepted,
        canSubmit: computed(
          () => termsAccepted() && evaluatePassword(password(), email()).valid && !!email(),
        ),
      },
      template: authPage(`
        <form data-testid="sign-up-card" style="${AUTH_FORM}" novalidate (submit)="$event.preventDefault()">
          <h1 style="${AUTH_TITLE}">Create your account</h1>
          <tar-text-field label="Email" type="email" autocomplete="email" testId="sign-up-email" [value]="email()" (valueChange)="email.set($event)" />
          <div style="display: grid; gap: var(--md-sys-space-2)">
            <tar-password-field label="Password" autocomplete="new-password" testId="sign-up-password" [value]="password()" (valueChange)="password.set($event)" />
            <tar-password-strength [password]="password()" [userEmail]="email()" />
          </div>
          <tar-text-field label="City" testId="sign-up-city" value="Toronto" />
          <tar-checkbox testId="sign-up-terms" [checked]="termsAccepted()" (checkedChange)="termsAccepted.set($event)">
            I accept the terms and privacy policy
          </tar-checkbox>
          <tar-button type="submit" testId="sign-up-submit" [fullWidth]="true" [disabled]="!canSubmit()">Create account</tar-button>
          <p style="${AUTH_TEXT}">Already have an account? <a routerLink="/sign-in" style="${AUTH_LINK}">Sign in</a></p>
        </form>
      `),
    };
  },
  parameters: {
    docs: {
      story: { height: '860px' },
      description: {
        story:
          'Live validation: `tar-password-strength` re-scores on every keystroke against the 12-character policy (upper, lower, digit, symbol, not your email) and shows the helper for whatever is missing. Add a symbol to reach "Strong" and tick the terms box: only then does "Create account" enable.',
      },
    },
  },
};

import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import { AUTH_FORM, AUTH_TEXT, AUTH_TITLE, authPage } from './auth';

export const AcceptInvitation: StoryObj = {
  name: 'Accept invitation',
  render: () => ({
    props: { password: signal('') },
    template: authPage(`
      <form data-testid="sign-up-card" style="${AUTH_FORM}" novalidate (submit)="$event.preventDefault()">
        <h1 style="${AUTH_TITLE}">Join The Upper Room</h1>
        <p style="${AUTH_TEXT}">Jordan Lee invited you to help out in Toronto.</p>
        <tar-text-field label="Email" type="email" testId="sign-up-email" value="marcus@newcomerhub.ca" [readonly]="true" suffixIcon="lock" hint="From your invitation" />
        <div style="display: grid; gap: var(--md-sys-space-2)">
          <tar-password-field label="Password" autocomplete="new-password" testId="sign-up-password" [value]="password()" (valueChange)="password.set($event)" />
          <tar-password-strength [password]="password()" userEmail="marcus@newcomerhub.ca" />
        </div>
        <tar-text-field label="City" testId="sign-up-city" value="Toronto" [readonly]="true" suffixIcon="lock" />
        <tar-checkbox testId="sign-up-terms">I accept the terms and privacy policy</tar-checkbox>
        <tar-button type="submit" testId="sign-up-submit" [fullWidth]="true" [disabled]="true">Create account</tar-button>
      </form>
    `),
  }),
  parameters: {
    docs: {
      story: { height: '860px' },
      description: {
        story:
          '`/invitations/accept` reuses the create-account card with the invited email and city pre-filled and `[readonly]="true"` (a lock `suffixIcon` and hint say why). Only the password and terms are left to the invitee.',
      },
    },
  },
};

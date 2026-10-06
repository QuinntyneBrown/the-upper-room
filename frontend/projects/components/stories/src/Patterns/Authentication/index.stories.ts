import { RouterLink } from '@angular/router';
import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  TarBanner,
  TarButton,
  TarCard,
  TarCheckbox,
  TarEmptyState,
  TarPasswordField,
  TarPasswordStrength,
  TarTextField,
} from 'components';

import descriptionMd from './AuthenticationDescription.md';

export { SignIn } from './AuthenticationSignIn.stories';
export { SignInError } from './AuthenticationSignInError.stories';
export { CreateAccount } from './AuthenticationCreateAccount.stories';
export { AcceptInvitation } from './AuthenticationAcceptInvitation.stories';
export { ForgotPassword } from './AuthenticationForgotPassword.stories';
export { InvitationExpired } from './AuthenticationInvitationExpired.stories';

export default {
  title: 'Patterns/Authentication',
  decorators: [
    moduleMetadata({
      imports: [
        TarBanner,
        TarButton,
        TarCard,
        TarCheckbox,
        TarEmptyState,
        TarPasswordField,
        TarPasswordStrength,
        TarTextField,
        RouterLink,
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '760px' },
      description: {
        component: descriptionMd,
      },
    },
  },
} as Meta;

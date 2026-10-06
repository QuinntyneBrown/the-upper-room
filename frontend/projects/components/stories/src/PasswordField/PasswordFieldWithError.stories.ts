import type { StoryObj } from '@storybook/angular';

import type { TarPasswordField } from 'components';

export const WithError: StoryObj<TarPasswordField> = {
  render: () => ({
    template: `
      <div style="max-width: 360px">
        <tar-password-field value="short" error="Use at least 12 characters." testId="invite-password" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`error` renders below the field as `.tar-password-field__error` with `role="alert"` and `data-testid="invite-password-error"`.',
      },
    },
  },
};

import type { StoryObj } from '@storybook/angular';

import type { TarTextField } from 'components';

export const HintAndError: StoryObj<TarTextField> = {
  render: () => ({
    template: `
      <div style="max-width: 420px; display: grid; gap: 16px">
        <tar-text-field label="Organisation name" value="Riverside Food Bank" hint="As it appears on the partner agreement." />
        <tar-text-field label="Email" type="email" value="maya.chen@" error="Enter an email like name@example.org" testId="contact-email" [required]="true" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`hint` sits in the form field subscript; `error` renders below it as `.tar-text-field__error` with `role="alert"` and `data-testid="contact-email-error"` (derived from `testId`).',
      },
    },
  },
};

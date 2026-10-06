import type { StoryObj } from '@storybook/angular';

import type { TarPasswordField } from 'components';

export const Disabled: StoryObj<TarPasswordField> = {
  render: () => ({
    template: `
      <div style="max-width: 360px">
        <tar-password-field value="harbour-lights-2026" [disabled]="true" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: '`disabled` disables the native input; the visibility toggle stays clickable.',
      },
    },
  },
};

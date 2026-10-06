import type { StoryObj } from '@storybook/angular';

import type { TarFormActions } from 'components';

export const States: StoryObj<TarFormActions> = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 8px; max-width: 480px">
        <strong>Pristine (dirty = false)</strong>
        <tar-form-actions saveType="button" [dirty]="false" />
        <strong>Saving</strong>
        <tar-form-actions saveLabel="Saving…" saveType="button" [saving]="true" />
        <strong>Disabled (invalid form)</strong>
        <tar-form-actions saveType="button" [disabled]="true" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'An unchanged form disables both buttons; `saving` disables both and shows the spinner; `disabled` disables only Save (Cancel stays available).',
      },
    },
  },
};

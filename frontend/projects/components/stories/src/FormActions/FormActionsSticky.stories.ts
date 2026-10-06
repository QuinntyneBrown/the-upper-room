import type { StoryObj } from '@storybook/angular';

import type { TarFormActions } from 'components';

export const Sticky: StoryObj<TarFormActions> = {
  render: () => ({
    template: `
      <div style="max-width: 480px; display: grid; gap: 8px; padding: 0 16px; border: 1px solid var(--md-sys-color-outline-variant)">
        <tar-text-field label="Event title" value="Spring volunteer orientation" />
        <tar-text-field label="Venue" value="Northside Community Hall" />
        <tar-form-actions saveLabel="Save event" saveType="button" [sticky]="true" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`sticky` adds `.tar-form-actions--sticky`: a surface background, a top border and `position: sticky; bottom: 0` on the inner `.tar-form-actions` div. Because that div is the only child of the `tar-form-actions` host, it can only stick within the host's own box — it does not stay pinned while a long form scrolls past it.",
      },
    },
  },
};

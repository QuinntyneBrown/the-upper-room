import type { StoryObj } from '@storybook/angular';

import type { TarTextField } from 'components';

export const States: StoryObj<TarTextField> = {
  render: () => ({
    template: `
      <div style="max-width: 420px; display: grid; gap: 16px">
        <tar-text-field label="City" value="" [required]="true" />
        <tar-text-field label="Contact ID" value="C-10482" [readonly]="true" hint="Assigned by the system." />
        <tar-text-field label="Partner since" value="March 2021" [disabled]="true" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`required` adds the required marker (hide it with `hideRequiredMarker`), `readonly` keeps the value selectable but not editable, and `disabled` disables the native input.',
      },
    },
  },
};

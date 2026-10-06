import type { StoryObj } from '@storybook/angular';

import type { ConfirmOptions, TarConfirmDialog } from 'components';

export const ViaService: StoryObj<TarConfirmDialog> = {
  render: () => {
    const options: ConfirmOptions = {
      title: 'Archive Northside Food Bank?',
      body: 'The partner will be hidden from lists. You can restore it from Archived partners.',
      confirmLabel: 'Archive partner',
    };
    return {
      props: { options },
      template: `
        <div style="min-height: 320px">
          <story-confirm-trigger [options]="options" testId="open-confirm">Archive partner</story-confirm-trigger>
        </div>
      `,
    };
  },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('[data-testid="open-confirm"]')?.click();
  },
  parameters: {
    docs: {
      description: {
        story:
          'How pages use it: `await confirmService.confirm(options)` opens the dialog in a `MatDialog` overlay and resolves `true` only when the user confirms (Cancel, Escape and backdrop clicks resolve `false`). In the story view it opens on load.',
      },
    },
  },
};

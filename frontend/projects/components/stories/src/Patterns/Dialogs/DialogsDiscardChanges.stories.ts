import type { StoryObj } from '@storybook/angular';

import type { ConfirmOptions } from 'components';

const confirm: ConfirmOptions = {
  title: 'Discard your changes?',
  body: "You've edited Jordan Lee's phone number and tags. Leaving now loses those edits.",
  severity: 'warning',
  confirmLabel: 'Discard',
  cancelLabel: 'Keep editing',
};

export const DiscardChanges: StoryObj = {
  name: 'Discard changes (warning)',
  render: () => ({
    props: { confirm },
    template: `
      <story-dialog-stage
        eyebrow="Contacts"
        pageTitle="Edit Jordan Lee"
        triggerLabel="Cancel"
        triggerVariant="text"
        [confirm]="confirm"
      />
    `,
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          '`severity: \'warning\'` tints the dialog with the tertiary container for recoverable losses such as unsaved edits. Both buttons get specific labels ("Keep editing" / "Discard") so the choice reads without the title.',
      },
    },
  },
};

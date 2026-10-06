import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import descriptionMd from './DialogsDescription.md';
import { StoryDialogStage } from './dialogs';

export { DestructiveDelete } from './DialogsDestructiveDelete.stories';
export { TypedConfirmation } from './DialogsTypedConfirmation.stories';
export { DiscardChanges } from './DialogsDiscardChanges.stories';
export { Informational } from './DialogsInformational.stories';
export { FormDialog } from './DialogsFormDialog.stories';
export { Mobile } from './DialogsMobile.stories';

export default {
  title: 'Patterns/Dialogs',
  decorators: [moduleMetadata({ imports: [StoryDialogStage] })],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '560px' },
      description: {
        component: descriptionMd,
      },
    },
  },
} as Meta;

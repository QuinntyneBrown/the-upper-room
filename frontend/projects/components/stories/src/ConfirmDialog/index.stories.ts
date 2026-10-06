import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarConfirmDialog } from 'components';

import { ConfirmDialogPreview } from './ConfirmDialogPreview';
import { ConfirmTrigger } from './ConfirmTrigger';
import descriptionMd from './ConfirmDialogDescription.md';
import bestPracticesMd from './ConfirmDialogBestPractices.md';

export { Default } from './ConfirmDialogDefault.stories';
export { Danger } from './ConfirmDialogDanger.stories';
export { Warning } from './ConfirmDialogWarning.stories';
export { TypedConfirmation } from './ConfirmDialogTypedConfirmation.stories';
export { ViaService } from './ConfirmDialogViaService.stories';

export default {
  title: 'Components/ConfirmDialog',
  component: TarConfirmDialog,
  decorators: [moduleMetadata({ imports: [ConfirmDialogPreview, ConfirmTrigger] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarConfirmDialog>;

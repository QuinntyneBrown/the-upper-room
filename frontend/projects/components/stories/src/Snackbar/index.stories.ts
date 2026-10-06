import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarSnackbar } from 'components';

import { SnackbarTrigger } from './SnackbarTrigger';
import descriptionMd from './SnackbarDescription.md';
import bestPracticesMd from './SnackbarBestPractices.md';

export { Default } from './SnackbarDefault.stories';
export { Severities } from './SnackbarSeverities.stories';
export { WithAction } from './SnackbarWithAction.stories';
export { Queue } from './SnackbarQueue.stories';
export { Shown } from './SnackbarShown.stories';

export default {
  title: 'Components/Snackbar',
  component: TarSnackbar,
  decorators: [moduleMetadata({ imports: [TarSnackbar, SnackbarTrigger] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarSnackbar>;

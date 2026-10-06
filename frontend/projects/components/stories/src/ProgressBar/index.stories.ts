import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarButton, TarProgressBar } from 'components';

import descriptionMd from './ProgressBarDescription.md';
import bestPracticesMd from './ProgressBarBestPractices.md';

export { Default } from './ProgressBarDefault.stories';
export { Modes } from './ProgressBarModes.stories';
export { ImportProgress } from './ProgressBarImportProgress.stories';
export { CardLoading } from './ProgressBarCardLoading.stories';

export default {
  title: 'Components/ProgressBar',
  component: TarProgressBar,
  decorators: [moduleMetadata({ imports: [TarProgressBar, TarButton] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarProgressBar>;

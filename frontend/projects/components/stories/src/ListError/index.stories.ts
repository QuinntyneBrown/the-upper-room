import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarListError, TarSkeleton } from 'components';

import descriptionMd from './ListErrorDescription.md';
import bestPracticesMd from './ListErrorBestPractices.md';

export { Default } from './ListErrorDefault.stories';
export { RetryFlow } from './ListErrorRetryFlow.stories';
export { InPanel } from './ListErrorInPanel.stories';

export default {
  title: 'Components/ListError',
  component: TarListError,
  decorators: [moduleMetadata({ imports: [TarListError, TarSkeleton] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarListError>;

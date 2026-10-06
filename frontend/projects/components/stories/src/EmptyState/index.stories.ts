import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarButton, TarEmptyState } from 'components';

import descriptionMd from './EmptyStateDescription.md';
import bestPracticesMd from './EmptyStateBestPractices.md';

export { Default } from './EmptyStateDefault.stories';
export { WithActions } from './EmptyStateWithActions.stories';
export { NoResults } from './EmptyStateNoResults.stories';
export { Gallery } from './EmptyStateGallery.stories';

export default {
  title: 'Components/EmptyState',
  component: TarEmptyState,
  decorators: [moduleMetadata({ imports: [TarEmptyState, TarButton] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarEmptyState>;

import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarButton, TarSkeleton } from 'components';

import descriptionMd from './SkeletonDescription.md';
import bestPracticesMd from './SkeletonBestPractices.md';

export { Default } from './SkeletonDefault.stories';
export { Compact } from './SkeletonCompact.stories';
export { CardGrid } from './SkeletonCardGrid.stories';
export { LoadingToContent } from './SkeletonLoadingToContent.stories';

export default {
  title: 'Components/Skeleton',
  component: TarSkeleton,
  decorators: [moduleMetadata({ imports: [TarSkeleton, TarButton] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarSkeleton>;

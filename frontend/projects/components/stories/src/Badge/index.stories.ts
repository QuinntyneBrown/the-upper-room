import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarBadge, TarButton, TarIconButton } from 'components';

import descriptionMd from './BadgeDescription.md';
import bestPracticesMd from './BadgeBestPractices.md';

export { Default } from './BadgeDefault.stories';
export { Positions } from './BadgePositions.stories';
export { Sizes } from './BadgeSizes.stories';
export { OnButton } from './BadgeOnButton.stories';
export { LiveCount } from './BadgeLiveCount.stories';

export default {
  title: 'Components/Badge',
  component: TarBadge,
  decorators: [moduleMetadata({ imports: [TarBadge, TarIconButton, TarButton] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarBadge>;

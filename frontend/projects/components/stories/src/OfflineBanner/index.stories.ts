import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { OfflineBanner } from 'components';

import descriptionMd from './OfflineBannerDescription.md';
import bestPracticesMd from './OfflineBannerBestPractices.md';

export { Default } from './OfflineBannerDefault.stories';
export { BackOnline } from './OfflineBannerBackOnline.stories';
export { Simulated } from './OfflineBannerSimulated.stories';

export default {
  title: 'Components/OfflineBanner',
  component: OfflineBanner,
  decorators: [moduleMetadata({ imports: [OfflineBanner] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<OfflineBanner>;

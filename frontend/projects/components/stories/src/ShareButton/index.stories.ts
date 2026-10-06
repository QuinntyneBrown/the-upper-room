import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarShareButton } from 'components';

import descriptionMd from './ShareButtonDescription.md';
import bestPracticesMd from './ShareButtonBestPractices.md';

export { Default } from './ShareButtonDefault.stories';
export { InPageHeader } from './ShareButtonInPageHeader.stories';
export { OnCard } from './ShareButtonOnCard.stories';

export default {
  title: 'Components/ShareButton',
  component: TarShareButton,
  decorators: [moduleMetadata({ imports: [TarShareButton] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarShareButton>;

import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarAvatar } from 'components';

import descriptionMd from './AvatarDescription.md';
import bestPracticesMd from './AvatarBestPractices.md';

export { Default } from './AvatarDefault.stories';
export { Sizes } from './AvatarSizes.stories';
export { Initials } from './AvatarInitials.stories';
export { WithImage } from './AvatarWithImage.stories';
export { InList } from './AvatarInList.stories';

export default {
  title: 'Components/Avatar',
  component: TarAvatar,
  decorators: [moduleMetadata({ imports: [TarAvatar] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarAvatar>;

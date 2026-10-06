import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarAvatarUploader } from 'components';

import descriptionMd from './AvatarUploaderDescription.md';
import bestPracticesMd from './AvatarUploaderBestPractices.md';

export { Default } from './AvatarUploaderDefault.stories';
export { WithImage } from './AvatarUploaderWithImage.stories';
export { Small } from './AvatarUploaderSmall.stories';
export { FileSelected } from './AvatarUploaderFileSelected.stories';

export default {
  title: 'Components/AvatarUploader',
  component: TarAvatarUploader,
  decorators: [moduleMetadata({ imports: [TarAvatarUploader] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarAvatarUploader>;

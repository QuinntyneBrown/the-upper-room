import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarButton, TarCard } from 'components';

import descriptionMd from './CardDescription.md';
import bestPracticesMd from './CardBestPractices.md';

export { Default } from './CardDefault.stories';
export { Appearance } from './CardAppearance.stories';
export { WithActions } from './CardWithActions.stories';
export { Interactive } from './CardInteractive.stories';
export { BodyOnly } from './CardBodyOnly.stories';

export default {
  title: 'Components/Card',
  component: TarCard,
  decorators: [moduleMetadata({ imports: [TarCard, TarButton] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarCard>;

import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarToggle } from 'components';

import descriptionMd from './ToggleDescription.md';
import bestPracticesMd from './ToggleBestPractices.md';

export { Default } from './ToggleDefault.stories';
export { States } from './ToggleStates.stories';
export { SettingsList } from './ToggleSettingsList.stories';

export default {
  title: 'Components/Toggle',
  component: TarToggle,
  decorators: [moduleMetadata({ imports: [TarToggle] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarToggle>;

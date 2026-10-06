import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarButton, TarIconButton, TarToolbar } from 'components';

import descriptionMd from './ToolbarDescription.md';
import bestPracticesMd from './ToolbarBestPractices.md';

export { Default } from './ToolbarDefault.stories';
export { WithMenu } from './ToolbarWithMenu.stories';
export { WithActions } from './ToolbarWithActions.stories';
export { Scrolled } from './ToolbarScrolled.stories';

export default {
  title: 'Components/Toolbar',
  component: TarToolbar,
  decorators: [moduleMetadata({ imports: [TarToolbar, TarButton, TarIconButton] })],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarToolbar>;

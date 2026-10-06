import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarButton, TarIconButton, TarTooltip } from 'components';

import descriptionMd from './TooltipDescription.md';
import bestPracticesMd from './TooltipBestPractices.md';

export { Default } from './TooltipDefault.stories';
export { Positions } from './TooltipPositions.stories';
export { Delays } from './TooltipDelays.stories';
export { Disabled } from './TooltipDisabled.stories';
export { Shown } from './TooltipShown.stories';

export default {
  title: 'Components/Tooltip',
  component: TarTooltip,
  decorators: [moduleMetadata({ imports: [TarTooltip, TarIconButton, TarButton] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarTooltip>;

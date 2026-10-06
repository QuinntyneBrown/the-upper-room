import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  TarAvatar,
  TarBanner,
  TarButton,
  TarCard,
  TarChip,
  TarChipSet,
  TarIcon,
  TarPageHeader,
  TarSkeleton,
} from 'components';

import { SHELL_IMPORTS } from '../shared/shell';
import descriptionMd from './KanbanBoardDescription.md';

export { Columns } from './KanbanBoardColumns.stories';
export { Filtered } from './KanbanBoardFiltered.stories';
export { OverWipLimit } from './KanbanBoardOverWipLimit.stories';
export { Loading } from './KanbanBoardLoading.stories';
export { Mobile } from './KanbanBoardMobile.stories';

export default {
  title: 'Patterns/KanbanBoard',
  decorators: [
    moduleMetadata({
      imports: [
        ...SHELL_IMPORTS,
        TarAvatar,
        TarBanner,
        TarButton,
        TarCard,
        TarChip,
        TarChipSet,
        TarIcon,
        TarPageHeader,
        TarSkeleton,
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '760px' },
      description: {
        component: descriptionMd,
      },
    },
  },
} as Meta;

import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  TarAvatar,
  TarButton,
  TarCard,
  TarChip,
  TarChipSet,
  TarEmptyState,
  TarFab,
  TarListError,
  TarPageHeader,
  TarPagination,
  TarSearchField,
  TarSkeleton,
} from 'components';

import { SHELL_IMPORTS } from '../shared/shell';
import descriptionMd from './ContactListDescription.md';

export { Desktop } from './ContactListDesktop.stories';
export { Searching } from './ContactListSearching.stories';
export { Empty } from './ContactListEmpty.stories';
export { Loading } from './ContactListLoading.stories';
export { LoadError } from './ContactListLoadError.stories';
export { Mobile } from './ContactListMobile.stories';

export default {
  title: 'Patterns/ContactList',
  decorators: [
    moduleMetadata({
      imports: [
        ...SHELL_IMPORTS,
        TarAvatar,
        TarButton,
        TarCard,
        TarChip,
        TarChipSet,
        TarEmptyState,
        TarFab,
        TarListError,
        TarPageHeader,
        TarPagination,
        TarSearchField,
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

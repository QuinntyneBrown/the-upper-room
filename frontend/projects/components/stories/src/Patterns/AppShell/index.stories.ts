import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  TarButton,
  TarCard,
  TarDrawer,
  TarIcon,
  TarList,
  TarListItem,
  TarPageHeader,
} from 'components';

import { SHELL_IMPORTS } from '../shared/shell';
import descriptionMd from './AppShellDescription.md';

export { Desktop } from './AppShellDesktop.stories';
export { Mobile } from './AppShellMobile.stories';
export { MobileDrawerOpen } from './AppShellMobileDrawerOpen.stories';
export { AdminDrawer } from './AppShellAdminDrawer.stories';
export { NotificationsPanel } from './AppShellNotificationsPanel.stories';

export default {
  title: 'Patterns/AppShell',
  decorators: [
    moduleMetadata({
      imports: [
        ...SHELL_IMPORTS,
        TarButton,
        TarCard,
        TarDrawer,
        TarIcon,
        TarList,
        TarListItem,
        TarPageHeader,
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '720px' },
      description: {
        component: descriptionMd,
      },
    },
  },
} as Meta;

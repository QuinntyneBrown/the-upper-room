import { addons } from 'storybook/manager-api';

import upperRoomTheme from './theme';

addons.setConfig({
  theme: upperRoomTheme,
  // Docs-first like the Fluent docsite: the addon panel opens on demand.
  showPanel: false,
  sidebar: {
    showRoots: true,
  },
});

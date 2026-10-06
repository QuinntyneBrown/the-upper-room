import type { StoryObj } from '@storybook/angular';

import { ICON_ALIASES, type TarIcon } from 'components';

export const AliasGallery: StoryObj<TarIcon> = {
  render: () => {
    return {
      props: { aliases: Object.entries(ICON_ALIASES) },
      template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px">
        @for (alias of aliases; track alias[0]) {
          <div style="display: flex; gap: 12px; align-items: center; padding: 8px; border: 1px solid var(--md-sys-color-outline-variant); border-radius: 8px">
            <tar-icon [name]="alias[0]" />
            <div style="display: grid">
              <code>{{ alias[0] }}</code>
              <small style="color: var(--md-sys-color-on-surface-variant)">{{ alias[1] }}</small>
            </div>
          </div>
        }
      </div>
    `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'Every entry in `ICON_ALIASES`: the alias to pass as `name`, and the Material Symbols ligature it resolves to.',
      },
    },
  },
};

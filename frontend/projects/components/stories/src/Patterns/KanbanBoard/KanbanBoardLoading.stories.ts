import type { StoryObj } from '@storybook/angular';

import { GUTTER, appShell, shellProps } from '../shared/shell';
import { boardHeaderMarkup, boardProps } from './board';

export const Loading: StoryObj = {
  render: () => ({
    props: { ...shellProps(true), ...boardProps() },
    template: appShell({
      active: 'boards',
      content: `
        ${boardHeaderMarkup()}
        <div aria-busy="true" aria-label="Loading cards" style="${GUTTER}; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(264px, 1fr); gap: var(--md-sys-space-3); overflow-x: auto">
          @for (n of [3, 2, 1, 2]; track $index) {
            <div style="padding: var(--md-sys-space-3); border-radius: var(--md-sys-shape-corner-large); background: var(--md-sys-color-surface-container-low)">
              <tar-skeleton [rowCount]="n" [rowHeight]="104" />
            </div>
          }
        </div>
      `,
    }),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'Column shells render immediately with `tar-skeleton` rows the height of a card, so the board does not reflow when cards arrive.',
      },
    },
  },
};

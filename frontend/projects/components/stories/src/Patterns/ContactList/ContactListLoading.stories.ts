import type { StoryObj } from '@storybook/angular';

import { GUTTER, appShell, shellProps } from '../shared/shell';
import { contactHeaderMarkup, contactListProps } from './contacts';

export const Loading: StoryObj = {
  render: () => ({
    props: { ...shellProps(true), ...contactListProps() },
    template: appShell({
      active: 'contacts',
      content: `
        ${contactHeaderMarkup()}
        <div style="${GUTTER}" aria-busy="true" aria-label="Loading contacts">
          <tar-skeleton [rowCount]="6" [rowHeight]="96" />
        </div>
      `,
    }),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          "While the first page loads, the header and search stay interactive and `tar-skeleton` holds the grid's place with rows the height of a contact card, so nothing jumps when data arrives. The shimmer stops under `prefers-reduced-motion`.",
      },
    },
  },
};

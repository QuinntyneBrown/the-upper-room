import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import { GUTTER, appShell, shellProps } from '../shared/shell';
import { COLUMNS, boardColumnsMarkup, boardHeaderMarkup, boardProps } from './board';

const overLimit = COLUMNS.map((col) =>
  col.id === 'doing'
    ? {
        ...col,
        cards: [
          ...col.cards,
          { id: 'k10', title: 'Book the van for pick-ups', tags: ['Logistics'], due: 'Oct 22' },
          {
            id: 'k11',
            title: 'Thank-you notes for September donors',
            tags: ['Donors'],
            assignee: { displayName: 'Priya Raman', email: 'priya.raman@tdsb.on.ca' },
          },
        ],
      }
    : col,
);

export const OverWipLimit: StoryObj = {
  name: 'Over WIP limit',
  render: () => ({
    props: { ...shellProps(true), ...boardProps(overLimit), bannerVisible: signal(true) },
    template: appShell({
      active: 'boards',
      content: `
        ${boardHeaderMarkup()}
        <div style="${GUTTER}">
          <tar-banner
            severity="warning"
            icon="warning"
            testId="board-wip-warning"
            message="In progress has 4 cards and a limit of 3. Finish or move one before starting more."
            actionLabel="Configure limits"
            [visible]="bannerVisible()"
            (dismissed)="bannerVisible.set(false)"
          />
        </div>
        ${boardColumnsMarkup()}
      `,
    }),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'A column over its limit gets `data-over-limit="true"`, an error-colour outline and an error-colour count, and a dismissible `tar-banner severity="warning"` explains it above the board. Over-limit moves are warned about, not blocked.',
      },
    },
  },
};

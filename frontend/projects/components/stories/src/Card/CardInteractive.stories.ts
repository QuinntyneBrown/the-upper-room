import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarCard } from 'components';

export const Interactive: StoryObj<TarCard> = {
  render: () => {
    const opened = signal<string | null>(null);
    return {
      props: { opened, open: (name: string) => opened.set(name) },
      template: `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px">
          <tar-card heading="Downtown outreach" subheading="Board · 12 cards" [interactive]="true" testId="board-card-downtown" (clicked)="open('Downtown outreach')">
            <p>Updated 2 hours ago</p>
          </tar-card>
          <tar-card heading="Summer camp planning" subheading="Board · 31 cards" [interactive]="true" testId="board-card-camp" (clicked)="open('Summer camp planning')">
            <p>Updated yesterday</p>
          </tar-card>
        </div>
        <p style="margin-top: 16px">Last opened: {{ opened() ?? 'none' }}</p>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`interactive` adds `.tar-card--interactive`, `role="button"` and `tabindex="0"`, a hover lift, and emits `clicked` on click or Enter.',
      },
    },
  },
};

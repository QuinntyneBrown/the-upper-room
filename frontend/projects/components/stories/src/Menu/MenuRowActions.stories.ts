import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarMenu, TarMenuItem } from 'components';

export const RowActions: StoryObj<TarMenu> = {
  render: () => {
    const last = signal<string | null>(null);
    const items: TarMenuItem[] = [
      { id: 'open', label: 'Open board', icon: 'view_kanban' },
      { id: 'rename', label: 'Rename', icon: 'edit' },
      { id: 'duplicate', label: 'Duplicate', icon: 'content_copy' },
      { id: 'export', label: 'Export cards', icon: 'download', disabled: true },
      { id: 'divider', label: '', divider: true },
      { id: 'delete', label: 'Delete board', icon: 'delete', danger: true },
    ];
    return {
      props: { items, last },
      template: `
        <div
          style="display: flex; align-items: center; justify-content: space-between; max-width: 420px; padding: 8px 8px 8px 16px; border-radius: 12px; background: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface)"
        >
          <span class="mat-body-large">Saturday outreach — Toronto</span>
          <tar-menu
            [items]="items"
            ariaLabel="Board actions"
            xPosition="before"
            testId="board-menu"
            (itemSelected)="last.set($event)"
          />
        </div>
        <p class="mat-body-medium">Last selected: {{ last() ?? 'nothing yet' }}</p>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "A typical overflow menu on a list row. `disabled` items can't be chosen, `divider` items render a `mat-divider`, and `danger` items get `.tar-menu__item--danger` (error colour). Choosing an item emits `itemSelected` with its `id`.",
      },
    },
  },
};

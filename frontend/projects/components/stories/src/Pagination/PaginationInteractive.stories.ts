import { computed, signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarPageChange, TarPagination } from 'components';

export const Interactive: StoryObj<TarPagination> = {
  render: () => {
    const length = 237;
    const pageIndex = signal(1);
    const pageSize = signal(25);
    const range = computed(() => {
      const start = pageIndex() * pageSize() + 1;
      const end = Math.min(length, start + pageSize() - 1);
      return `${start}–${end}`;
    });
    return {
      props: {
        length,
        pageIndex,
        pageSize,
        range,
        onPage: (e: TarPageChange) => {
          pageIndex.set(e.pageIndex);
          pageSize.set(e.pageSize);
        },
      },
      template: `
        <div style="display: grid; gap: 8px">
          <p class="mat-body-medium" style="margin: 0">
            Showing contacts {{ range() }} of {{ length }} (page index {{ pageIndex() }})
          </p>
          <tar-pagination
            [length]="length"
            [pageIndex]="pageIndex()"
            [pageSize]="pageSize()"
            (pageChange)="onPage($event)"
          />
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`pageChange` emits `TarPageChange { pageIndex, pageSize, previousPageIndex }`. Keep the page state in the parent (here, signals) and feed it back through `pageIndex` and `pageSize`.',
      },
    },
  },
};

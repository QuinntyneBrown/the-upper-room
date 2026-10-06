import { computed, signal } from '@angular/core';

import { GUTTER } from '../shared/shell';

export interface StoryCard {
  readonly id: string;
  readonly title: string;
  readonly tags: readonly string[];
  readonly assignee?: { readonly displayName: string; readonly email: string };
  readonly due?: string;
  readonly overdue?: boolean;
  readonly archived?: boolean;
}

export interface StoryColumn {
  readonly id: string;
  readonly name: string;
  readonly wipLimit: number | null;
  readonly cards: readonly StoryCard[];
}

const AMA = { displayName: 'Ama Mensah', email: 'ama.mensah@dailybread.org' };
const JORDAN = { displayName: 'Jordan Lee', email: 'jordan@kensingtonkitchen.ca' };
const PRIYA = { displayName: 'Priya Raman', email: 'priya.raman@tdsb.on.ca' };
const QUINN = { displayName: 'Quinn Brown', email: 'quinn.brown@theupperroom.org' };

export const BOARD_TAGS = ['Outreach', 'Logistics', 'Donors', 'Volunteers'] as const;

export const COLUMNS: readonly StoryColumn[] = [
  {
    id: 'todo',
    name: 'To do',
    wipLimit: null,
    cards: [
      {
        id: 'k1',
        title: 'Ask St. Lawrence Hall about a December date',
        tags: ['Logistics'],
        assignee: QUINN,
        due: 'Oct 16',
      },
      { id: 'k2', title: 'Draft the coat-drive flyer', tags: ['Outreach'], assignee: PRIYA },
      { id: 'k3', title: 'List sizes we ran short of last year', tags: ['Logistics'] },
      {
        id: 'k9',
        title: 'Old: book the 2025 van',
        tags: ['Logistics'],
        archived: true,
      },
    ],
  },
  {
    id: 'doing',
    name: 'In progress',
    wipLimit: 3,
    cards: [
      {
        id: 'k4',
        title: 'Call Daily Bread about pallets',
        tags: ['Logistics', 'Donors'],
        assignee: AMA,
        due: 'Oct 9',
        overdue: true,
      },
      {
        id: 'k5',
        title: 'Recruit Saturday sorting volunteers',
        tags: ['Volunteers', 'Outreach'],
        assignee: JORDAN,
        due: 'Oct 20',
      },
    ],
  },
  {
    id: 'review',
    name: 'Waiting on partner',
    wipLimit: 2,
    cards: [
      {
        id: 'k6',
        title: 'Confirm drop-off hours with Kensington Community Kitchen',
        tags: ['Donors'],
        assignee: JORDAN,
        due: 'Oct 12',
      },
    ],
  },
  {
    id: 'done',
    name: 'Done',
    wipLimit: null,
    cards: [
      { id: 'k7', title: 'Set up the donations email alias', tags: [], assignee: QUINN },
      { id: 'k8', title: 'Pick a date for the giveaway', tags: ['Logistics'], assignee: AMA },
    ],
  },
];

/** Story props: active tag filters, Show archived, and the derived columns. */
export function boardProps(columns: readonly StoryColumn[] = COLUMNS, activeTags: string[] = []) {
  const tags = signal<readonly string[]>(activeTags);
  const showArchived = signal(false);
  return {
    tags: BOARD_TAGS,
    activeTags: tags,
    showArchived,
    toggleTag: (tag: string, on: boolean) =>
      tags.update((t) => (on ? [...t, tag] : t.filter((x) => x !== tag))),
    columns: computed(() =>
      columns.map((col) => ({
        ...col,
        count: col.cards.filter((c) => !c.archived).length,
        visible: col.cards.filter(
          (c) =>
            (showArchived() || !c.archived) &&
            (tags().length === 0 || c.tags.some((t) => tags().includes(t))),
        ),
      })),
    ),
  };
}

export const boardHeaderMarkup = (): string => `
  <tar-page-header eyebrow="Kanban Boards" title="Winter coat drive" subtitle="Collecting and sorting coats for the December giveaway.">
    <tar-button variant="outlined" icon="tune" testId="board-configure">Configure</tar-button>
  </tar-page-header>
  <div role="group" aria-label="Tag filters" style="${GUTTER}; display: flex; flex-wrap: wrap; gap: var(--md-sys-space-2)">
    @for (tag of tags; track tag) {
      <tar-chip [label]="tag" [selectable]="true" [selected]="activeTags().includes(tag)" [testId]="'board-tag-filter-' + tag" (selectionChange)="toggleTag(tag, $event)" />
    }
    <tar-chip label="Show archived" icon="inventory_2" testId="board-show-archived" [selectable]="true" [selected]="showArchived()" (selectionChange)="showArchived.set($event)" />
  </div>
`;

const COLUMN_STYLE =
  'display: grid; gap: var(--md-sys-space-2); align-content: start; padding: var(--md-sys-space-3); border-radius: var(--md-sys-shape-corner-large); background: var(--md-sys-color-surface-container-low)';

/** Columns laid out side by side, scrolling horizontally when they do not fit. */
export const boardColumnsMarkup = (columnWidth = 'minmax(264px, 1fr)'): string => `
  <div data-testid="board-view-columns" style="${GUTTER}; display: grid; grid-auto-flow: column; grid-auto-columns: ${columnWidth}; gap: var(--md-sys-space-3); align-items: start; overflow-x: auto; padding-bottom: var(--md-sys-space-2)">
    @for (column of columns(); track column.id) {
      @let over = column.wipLimit !== null && column.count > column.wipLimit;
      <section
        [attr.aria-label]="column.name"
        [attr.data-testid]="'board-column-' + column.name"
        [attr.data-over-limit]="over ? 'true' : null"
        style="${COLUMN_STYLE}"
        [style.box-shadow]="over ? 'inset 0 0 0 2px var(--md-sys-color-error)' : null"
      >
        <header style="display: flex; align-items: baseline; justify-content: space-between; gap: var(--md-sys-space-2); padding: var(--md-sys-space-1) var(--md-sys-space-1) var(--md-sys-space-2)">
          <h2 style="margin: 0; font: var(--md-sys-typescale-title-small); color: var(--md-sys-color-on-surface)">{{ column.name }}</h2>
          <span
            style="font: var(--md-sys-typescale-label-medium)"
            [style.color]="over ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface-variant)'"
            [attr.aria-label]="column.wipLimit === null ? column.count + ' cards' : column.count + ' of ' + column.wipLimit + ' cards allowed'"
          >{{ column.count }}{{ column.wipLimit === null ? '' : ' / ' + column.wipLimit }}</span>
        </header>
        @for (card of column.visible; track card.id) {
          <tar-card appearance="outlined" [interactive]="true" [testId]="'board-card-' + card.title" [style.opacity]="card.archived ? 0.6 : null">
            <div style="display: grid; gap: var(--md-sys-space-2)">
              <span style="font: var(--md-sys-typescale-body-large); color: var(--md-sys-color-on-surface)">{{ card.title }}</span>
              @if (card.tags.length > 0 || card.archived) {
                <tar-chip-set [ariaLabel]="'Tags for ' + card.title">
                  @for (tag of card.tags; track tag) {
                    <tar-chip [label]="tag" />
                  }
                  @if (card.archived) {
                    <tar-chip label="Archived" icon="inventory_2" />
                  }
                </tar-chip-set>
              }
              @if (card.assignee || card.due) {
                <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--md-sys-space-2)">
                  @if (card.assignee) {
                    <span style="display: inline-flex; align-items: center; gap: var(--md-sys-space-2); font: var(--md-sys-typescale-label-medium); color: var(--md-sys-color-on-surface-variant)">
                      <tar-avatar [user]="card.assignee" [size]="24" />
                      {{ card.assignee.displayName }}
                    </span>
                  }
                  @if (card.due) {
                    <span
                      style="display: inline-flex; align-items: center; gap: var(--md-sys-space-1); margin-left: auto; font: var(--md-sys-typescale-label-medium)"
                      [style.color]="card.overdue ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-on-surface-variant)'"
                    >
                      <tar-icon name="event" size="sm" />
                      {{ card.overdue ? 'Overdue · ' : 'Due ' }}{{ card.due }}
                    </span>
                  }
                </div>
              }
            </div>
          </tar-card>
        } @empty {
          <p style="margin: 0; padding: var(--md-sys-space-4) var(--md-sys-space-2); text-align: center; font: var(--md-sys-typescale-body-medium); color: var(--md-sys-color-on-surface-variant)">No cards match these filters</p>
        }
        <tar-button variant="text" icon="add" [testId]="'board-column-add-card-' + column.name">Add card</tar-button>
      </section>
    }
  </div>
`;

import type { StoryObj } from '@storybook/angular';

import type { TarRelativeTime } from 'components';

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);

export const Ranges: StoryObj<TarRelativeTime> = {
  render: () => ({
    props: {
      rows: [
        { label: 'Under a minute', ts: minutesAgo(0) },
        { label: 'Minutes', ts: minutesAgo(12) },
        { label: 'Hours', ts: minutesAgo(5 * 60) },
        { label: 'Days (up to 7)', ts: minutesAgo(3 * 24 * 60) },
        { label: 'Older', ts: '2026-03-14T18:30:00Z' },
      ],
    },
    template: `
      <dl style="display: grid; grid-template-columns: max-content 1fr; gap: 8px 24px; margin: 0; font: var(--md-sys-typescale-body-medium)">
        @for (r of rows; track r.label) {
          <dt style="color: var(--md-sys-color-on-surface-variant)">{{ r.label }}</dt>
          <dd style="margin: 0"><tar-relative-time [timestamp]="r.ts" /></dd>
        }
      </dl>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '"just now" under a minute, then `12m ago`, `5h ago` and `3d ago`; anything more than seven days old falls back to a locale date (`MMM d, y`). `timestamp` accepts a `Date` or an ISO string.',
      },
    },
  },
};

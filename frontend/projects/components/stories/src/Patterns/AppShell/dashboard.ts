import { GUTTER } from '../shared/shell';

const STATS = [
  { label: 'Contacts', value: 128, icon: 'person' },
  { label: 'Partners', value: 14, icon: 'domain' },
  { label: 'Upcoming events', value: 6, icon: 'event' },
  { label: 'Open cards', value: 23, icon: 'view_kanban' },
];

const EVENTS = [
  {
    title: 'Saturday breakfast club',
    when: 'Sat 10 Oct · 8:30 am · Kensington Community Kitchen',
  },
  {
    title: 'Partner roundtable: winter coat drive',
    when: 'Tue 13 Oct · 6:00 pm · St. Lawrence Hall',
  },
  { title: 'Volunteer orientation', when: 'Thu 15 Oct · 7:00 pm · The Upper Room, Queen St W' },
];

/** The dashboard body (user guide section 4), used as the content inside the shell stories. */
export const dashboardMarkup = (name = 'Quinn'): string => `
  <tar-page-header title="Welcome, ${name}" eyebrow="Toronto" subtitle="Here's what's happening across your city this week." />
  <div style="${GUTTER}; display: grid; gap: var(--md-sys-space-4); grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))">
    ${STATS.map(
      (s) => `
        <tar-card appearance="outlined">
          <div style="display: grid; gap: var(--md-sys-space-1)">
            <tar-icon name="${s.icon}" />
            <span style="font: var(--md-sys-typescale-display-small); color: var(--md-sys-color-on-surface)">${s.value}</span>
            <span style="font: var(--md-sys-typescale-label-large); color: var(--md-sys-color-on-surface-variant)">${s.label}</span>
          </div>
        </tar-card>
      `,
    ).join('')}
  </div>
  <div style="${GUTTER}">
    <tar-card heading="Upcoming events" subheading="Next three in Toronto" appearance="outlined" [showActions]="true">
      <tar-list ariaLabel="Upcoming events">
        ${EVENTS.map(
          (e) =>
            `<tar-list-item [interactive]="true" icon="event" title="${e.title}" description="${e.when}" />`,
        ).join('')}
      </tar-list>
      <tar-button tar-card-actions variant="text" icon="calendar_month">View calendar</tar-button>
    </tar-card>
  </div>
`;

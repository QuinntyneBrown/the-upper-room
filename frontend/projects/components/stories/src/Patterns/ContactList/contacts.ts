import { computed, signal } from '@angular/core';

import { GUTTER } from '../shared/shell';

export interface StoryContact {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly title: string;
  readonly org: string;
  readonly phone: string;
  readonly tags: readonly string[];
  readonly archived?: boolean;
}

export const CONTACTS: readonly StoryContact[] = [
  {
    id: 'c1',
    displayName: 'Ama Mensah',
    email: 'ama.mensah@dailybread.org',
    title: 'Volunteer coordinator',
    org: 'Daily Bread Food Bank',
    phone: '(416) 555-0142',
    tags: ['Food security', 'Partner lead'],
  },
  {
    id: 'c2',
    displayName: 'Jordan Lee',
    email: 'jordan@kensingtonkitchen.ca',
    title: 'Executive director',
    org: 'Kensington Community Kitchen',
    phone: '(416) 555-0187',
    tags: ['Food security', 'Board', 'Donor'],
  },
  {
    id: 'c3',
    displayName: 'Priya Raman',
    email: 'priya.raman@tdsb.on.ca',
    title: 'Youth programmes lead',
    org: 'Toronto District School Board',
    phone: '(647) 555-0110',
    tags: ['Youth mentoring'],
  },
  {
    id: 'c4',
    displayName: 'Marcus Oyelaran',
    email: 'marcus@newcomerhub.ca',
    title: 'Settlement counsellor',
    org: 'Newcomer Hub',
    phone: '(416) 555-0199',
    tags: ['Newcomer support', 'Translation'],
  },
  {
    id: 'c5',
    displayName: 'Sofia Alvarez',
    email: 'sofia.alvarez@stlawrencehall.ca',
    title: 'Events manager',
    org: 'St. Lawrence Hall',
    phone: '(416) 555-0123',
    tags: ['Venue'],
  },
  {
    id: 'c6',
    displayName: 'Daniel Park',
    email: 'dpark@parkdalelegal.org',
    title: 'Staff lawyer',
    org: 'Parkdale Legal Clinic',
    phone: '(416) 555-0164',
    tags: ['Legal aid', 'Newcomer support'],
  },
  {
    id: 'c7',
    displayName: 'Grace Whitford',
    email: 'grace.whitford@gmail.com',
    title: 'Retired nurse',
    org: '',
    phone: '(647) 555-0131',
    tags: ['Volunteer'],
    archived: true,
  },
];

/** Story props for the contact list: a live search query and the Archived filter. */
export function contactListProps(query = '', showArchived = false) {
  const q = signal(query);
  const archived = signal(showArchived);
  return {
    query: q,
    showArchived: archived,
    visible: computed(() => {
      const term = q().trim().toLowerCase();
      return CONTACTS.filter((c) => archived() || !c.archived).filter(
        (c) =>
          !term ||
          [c.displayName, c.org, c.email, c.phone].some((v) => v.toLowerCase().includes(term)),
      );
    }),
  };
}

export const contactHeaderMarkup = (fab = false): string => `
  <tar-page-header title="Contacts" eyebrow="Toronto" subtitle="128 people across 14 partners">
    ${fab ? '' : '<tar-button icon="person_add" testId="contacts-new-button">New contact</tar-button>'}
  </tar-page-header>
  <div style="${GUTTER}; display: flex; flex-wrap: wrap; align-items: center; gap: var(--md-sys-space-3)">
    <tar-search-field
      style="flex: 1 1 280px"
      testId="contacts-search"
      placeholder="Search contacts"
      [value]="query()"
      (valueChange)="query.set($event)"
    />
    <tar-chip
      label="Archived"
      icon="inventory_2"
      testId="contacts-filter-archived"
      [selectable]="true"
      [selected]="showArchived()"
      (selectionChange)="showArchived.set($event)"
    />
  </div>
`;

/** One `tar-card` per contact; reads `visible()` from {@link contactListProps}. */
export const contactGridMarkup = (columns = 'repeat(auto-fill, minmax(300px, 1fr))'): string => `
  @if (visible().length === 0) {
    <tar-empty-state icon="search_off" heading="No contacts match “{{ query() }}”" body="Try a first name, an organisation or part of a phone number.">
      <tar-button variant="text" (clicked)="query.set('')">Clear search</tar-button>
    </tar-empty-state>
  } @else {
    <div data-testid="contacts-grid" style="${GUTTER}; display: grid; gap: var(--md-sys-space-3); grid-template-columns: ${columns}">
      @for (contact of visible(); track contact.id) {
        <tar-card appearance="outlined" [interactive]="true" [testId]="'contact-card-' + contact.displayName" [style.opacity]="contact.archived ? 0.6 : null">
          <div style="display: flex; gap: var(--md-sys-space-3); align-items: flex-start">
            <tar-avatar [user]="contact" [size]="48" />
            <div style="display: grid; gap: var(--md-sys-space-1); min-width: 0">
              <span style="font: var(--md-sys-typescale-title-medium); color: var(--md-sys-color-on-surface)">{{ contact.displayName }}</span>
              <span style="font: var(--md-sys-typescale-body-medium); color: var(--md-sys-color-on-surface-variant)">{{ contact.title }}{{ contact.org ? ' @ ' + contact.org : '' }}</span>
              <span style="font: var(--md-sys-typescale-body-small); color: var(--md-sys-color-on-surface-variant)">{{ contact.phone }} · {{ contact.email }}</span>
              <tar-chip-set [ariaLabel]="'Tags for ' + contact.displayName">
                @for (tag of contact.tags; track tag) {
                  <tar-chip [label]="tag" />
                }
                @if (contact.archived) {
                  <tar-chip label="Archived" icon="inventory_2" />
                }
              </tar-chip-set>
            </div>
          </div>
        </tar-card>
      }
    </div>
  }
`;

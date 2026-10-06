// Seed data for the in-browser mock backend. Mirrors the shapes the Angular app
// reads (see the DTO interfaces next to each page) and the four standard
// development users the real backend seeds (admin, lead, member, guest).

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  city: string;
  role: string;
  status: string;
  lastSignIn: string;
  theme?: string;
}


export interface MockTag { id: string; name: string; color: string }
export interface MockContactMethod { value: string; label?: string; primary: boolean }
export interface MockContact {
  id: string;
  name: string;
  cityId: string;
  title?: string;
  org?: string;
  phones: MockContactMethod[];
  emails: MockContactMethod[];
  tags: MockTag[];
  archived: boolean;
  [key: string]: unknown;
}
export interface MockPartner {
  id: string;
  name: string;
  website: string | null;
  cityId: string;
  contactCount: number;
  tags: MockTag[];
  archived: boolean;
  logo: string | null;
  descriptionMarkdown: string | null;
  addresses: { street?: string; city?: string; country?: string }[];
  socialLinks: { platform: string; url: string; label?: string }[];
  contacts: string[];
  [key: string]: unknown;
}
export interface MockLocation {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  capacity: number | null;
  lat: number | null;
  lng: number | null;
  archived: boolean;
  photos: string[];
  eventCount: number;
  [key: string]: unknown;
}
export interface MockAttendee { id: string; name: string; avatarUrl: string | null; rsvpStatus: string }
export interface MockEvent {
  id: string;
  title: string;
  coverImageUrl: string | null;
  status: string;
  startAt: string;
  endAt: string;
  location: string | null;
  isVirtual: boolean;
  rsvpCount: number;
  capacity: number | null;
  tags: string[];
  description: string | null;
  attendees: MockAttendee[];
  requiresApproval: boolean;
  recurrenceRule: string | null;
  recurrenceId: string | null;
  occurrenceDate: string | null;
  timezone: string | null;
  organizerId: string;
  [key: string]: unknown;
}
export interface MockIdeaComment { id: string; ideaId: string; body: string; author: string; createdAt: string }
export interface MockIdea {
  id: string;
  title: string;
  description: string;
  bodyMarkdown: string;
  bodyHtmlSanitized: string;
  coverImageUrl: string | null;
  status: string;
  voteCount: number;
  hasVoted: boolean;
  proposedBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  linkedPartners: { id: string; name: string }[];
  comments: MockIdeaComment[];
  [key: string]: unknown;
}
export interface MockColumn { id: string; name: string; color: string; wipLimit?: number }
export interface MockCard {
  id: string;
  columnId: string;
  title: string;
  tags: MockTag[];
  assigneeName: string | null;
  dueDate: string | null;
  swimlaneKey: string | null;
  archived: boolean;
  data: Record<string, string | null>;
  [key: string]: unknown;
}
export interface MockBoard {
  id: string;
  name: string;
  description: string | null;
  columns: MockColumn[];
  cards: MockCard[];
  cardSchema: { key: string; label: string; type: 'text'; required: boolean }[];
  swimlaneMode: string;
  lastActivityAt: string;
  [key: string]: unknown;
}
export interface MockNoteRevision { id: string; bodyMarkdown: string; bodyHtmlSanitized: string; createdAt: string; createdBy: string }
export interface MockNote {
  id: string;
  subjectType: string;
  subjectId: string;
  bodyMarkdown: string;
  bodyHtmlSanitized: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  history: MockNoteRevision[];
}
export interface MockNotification {
  id: string;
  code: string;
  title: string;
  body: string;
  data: Record<string, string> | null;
  read: boolean;
  createdAt: string;
  deepLink: string | null;
  severity: string;
}
export interface MockInvitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  city: string;
  status: string;
  token: string;
  message?: string;
}

const CITY_LEAD_RESOURCES = ['Contact', 'Partner', 'Tag', 'Note', 'KanbanBoard', 'Idea', 'Event', 'Location'];
const CRUD = ['Read', 'Create', 'Update', 'Delete'];

function cityLeadPermissions(): string[] {
  const perms = CITY_LEAD_RESOURCES.flatMap((r) => CRUD.map((a) => `${r}:${a}`));
  perms.push('KanbanBoard:Configure');
  return perms;
}

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  SystemAdmin: [...cityLeadPermissions(), 'User:Manage', 'Role:Manage', 'Audit:Read', 'City:Switch'],
  CityLead: cityLeadPermissions(),
  Member: [
    ...CITY_LEAD_RESOURCES.map((r) => `${r}:Read`),
    'Note:Create',
    'Idea:Create',
    'Event:RSVP',
  ],
  Guest: ['Event:Read', 'Event:RSVP'],
};

export const USERS: MockUser[] = [
  { id: 'admin', email: 'admin@test.local', firstName: 'Ada', lastName: 'Admin', city: 'toronto', role: 'SystemAdmin', status: 'Active', lastSignIn: '2026-06-01T09:00:00Z' },
  { id: 'lead', email: 'lead@test.local', firstName: 'Jane', lastName: 'Lead', city: 'toronto', role: 'CityLead', status: 'Active', lastSignIn: '2026-06-02T09:00:00Z' },
  { id: 'member', email: 'member@test.local', firstName: 'Mark', lastName: 'Member', city: 'toronto', role: 'Member', status: 'Active', lastSignIn: '2026-06-03T09:00:00Z' },
  { id: 'guest', email: 'guest@test.local', firstName: 'Gia', lastName: 'Guest', city: 'toronto', role: 'Guest', status: 'Invited', lastSignIn: '' },
];

export const CITIES = [
  { id: 'toronto', name: 'Toronto', slug: 'toronto', country: 'CA', archived: false, members: 12 },
  { id: 'vancouver', name: 'Vancouver', slug: 'vancouver', country: 'CA', archived: false, members: 5 },
  { id: 'montreal', name: 'Montreal', slug: 'montreal', country: 'CA', archived: true, members: 0 },
];

export const TAGS: MockTag[] = [
  { id: 'tag-1', name: 'Volunteer', color: 'blue' },
  { id: 'tag-2', name: 'Donor', color: 'green' },
  { id: 'tag-3', name: 'Youth', color: 'purple' },
];

export const CONTACTS: MockContact[] = [
  {
    id: 'c1',
    name: 'Alice Johnson',
    cityId: 'toronto',
    title: 'Pastor',
    org: 'Grace Church',
    phones: [{ value: '416-555-0101', label: 'Mobile', primary: true }],
    emails: [{ value: 'alice@example.com', label: 'Work', primary: true }],
    tags: [TAGS[0]],
    archived: false,
  },
  {
    id: 'c2',
    name: 'Bob Smith',
    cityId: 'toronto',
    title: 'Volunteer Coordinator',
    org: 'Hope Outreach',
    phones: [{ value: '416-555-0102', label: 'Mobile', primary: true }],
    emails: [{ value: 'bob@example.com', label: 'Personal', primary: true }],
    tags: [TAGS[1]],
    archived: false,
  },
  {
    id: 'c3',
    name: 'Carol White',
    cityId: 'vancouver',
    title: 'Youth Leader',
    org: 'Harbour Fellowship',
    phones: [],
    emails: [{ value: 'carol@example.com', label: 'Work', primary: true }],
    tags: [TAGS[2]],
    archived: true,
  },
];

export const PARTNERS: MockPartner[] = [
  {
    id: 'p1',
    name: 'Grace Church',
    website: 'https://grace.example.com',
    cityId: 'toronto',
    contactCount: 1,
    tags: [TAGS[0]],
    archived: false,
    logo: null,
    descriptionMarkdown: 'A **partner** church downtown.',
    addresses: [{ street: '1 King St W', city: 'Toronto', country: 'CA' }],
    socialLinks: [{ platform: 'instagram', url: 'https://instagram.com/grace', label: '@grace' }],
    contacts: ['c1'],
  },
  {
    id: 'p2',
    name: 'Hope Outreach',
    website: null,
    cityId: 'toronto',
    contactCount: 0,
    tags: [],
    archived: false,
    logo: null,
    descriptionMarkdown: null,
    addresses: [],
    socialLinks: [],
    contacts: [],
  },
];

export const LOCATIONS: MockLocation[] = [
  {
    id: 'loc-1',
    name: 'City Hall',
    street: '100 Queen St W',
    city: 'Toronto',
    state: 'ON',
    country: 'CA',
    postalCode: 'M5H 2N2',
    capacity: 200,
    lat: 43.6534,
    lng: -79.3841,
    archived: false,
    photos: [],
    eventCount: 1,
  },
  {
    id: 'loc-2',
    name: 'Harbourfront Centre',
    street: '235 Queens Quay W',
    city: 'Toronto',
    state: 'ON',
    country: 'CA',
    postalCode: 'M5J 2G8',
    capacity: 500,
    lat: 43.6387,
    lng: -79.3816,
    archived: false,
    photos: [],
    eventCount: 0,
  },
];

export const EVENTS: MockEvent[] = [
  {
    id: 'ev1',
    title: 'City Prayer Night',
    coverImageUrl: null,
    status: 'Published',
    startAt: '2026-06-15T19:00:00Z',
    endAt: '2026-06-15T21:00:00Z',
    location: 'City Hall',
    isVirtual: false,
    rsvpCount: 12,
    capacity: 50,
    tags: ['Prayer'],
    description: 'An evening of prayer for the city.',
    attendees: [
      { id: 'lead', name: 'Jane Lead', avatarUrl: null, rsvpStatus: 'Going' },
      { id: 'member', name: 'Mark Member', avatarUrl: null, rsvpStatus: 'Going' },
    ],
    requiresApproval: false,
    recurrenceRule: null,
    recurrenceId: null,
    occurrenceDate: null,
    timezone: 'America/Toronto',
    organizerId: 'lead',
  },
  {
    id: 'ev2',
    title: 'Youth Worship',
    coverImageUrl: null,
    status: 'Draft',
    startAt: '2026-06-22T18:00:00Z',
    endAt: '2026-06-22T20:00:00Z',
    location: null,
    isVirtual: true,
    rsvpCount: 0,
    capacity: null,
    tags: [],
    description: null,
    attendees: [],
    requiresApproval: true,
    recurrenceRule: null,
    recurrenceId: null,
    occurrenceDate: null,
    timezone: 'America/Toronto',
    organizerId: 'lead',
  },
];

export const IDEAS: MockIdea[] = [
  {
    id: 'idea-1',
    title: 'Community Garden',
    description: 'Start a community garden behind the church.',
    bodyMarkdown: 'Start a **community garden** behind the church.',
    bodyHtmlSanitized: '<p>Start a <strong>community garden</strong> behind the church.</p>',
    coverImageUrl: null,
    status: 'Submitted',
    voteCount: 3,
    hasVoted: false,
    proposedBy: 'lead',
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
    tags: ['Outreach'],
    linkedPartners: [],
    comments: [],
  },
  {
    id: 'idea-2',
    title: 'Winter Coat Drive',
    description: 'Collect coats for the shelter.',
    bodyMarkdown: 'Collect coats for the shelter.',
    bodyHtmlSanitized: '<p>Collect coats for the shelter.</p>',
    coverImageUrl: null,
    status: 'UnderReview',
    voteCount: 7,
    hasVoted: true,
    proposedBy: 'member',
    createdAt: '2026-04-10T10:00:00Z',
    updatedAt: '2026-04-12T10:00:00Z',
    tags: [],
    linkedPartners: [{ id: 'p2', name: 'Hope Outreach' }],
    comments: [],
  },
];

export const BOARDS: MockBoard[] = [
  {
    id: 'board-1',
    name: 'City Planning',
    description: 'Planning board for the Toronto team.',
    columns: [
      { id: 'col-1', name: 'To Do', color: 'blue' },
      { id: 'col-2', name: 'In Progress', color: 'orange', wipLimit: 3 },
      { id: 'col-3', name: 'Done', color: 'green' },
    ],
    cards: [
      { id: 'card-1', columnId: 'col-1', title: 'Follow up with venue', tags: [], assigneeName: 'Jane Lead', dueDate: '2026-06-10', swimlaneKey: null, archived: false, data: {} },
      { id: 'card-2', columnId: 'col-2', title: 'Design flyer', tags: [{ id: 'tag-3', name: 'Youth', color: 'purple' }], assigneeName: null, dueDate: null, swimlaneKey: null, archived: false, data: {} },
      { id: 'card-3', columnId: 'col-3', title: 'Book speaker', tags: [], assigneeName: 'Mark Member', dueDate: null, swimlaneKey: null, archived: false, data: {} },
    ],
    cardSchema: [],
    swimlaneMode: 'None',
    lastActivityAt: '2026-06-01T12:00:00Z',
  },
];

export const NOTIFICATIONS: MockNotification[] = [
  {
    id: 'n1',
    code: 'EventPublished',
    title: 'City Prayer Night published',
    body: 'The event is now visible to members.',
    data: { eventId: 'ev1' },
    read: false,
    createdAt: '2026-06-01T09:00:00Z',
    deepLink: '/events/ev1',
    severity: 'info',
  },
  {
    id: 'n2',
    code: 'IdeaStatusChanged',
    title: 'Winter Coat Drive is under review',
    body: 'A lead is reviewing the idea.',
    data: { ideaId: 'idea-2' },
    read: true,
    createdAt: '2026-05-20T09:00:00Z',
    deepLink: '/ideas/idea-2',
    severity: 'info',
  },
];

export const NOTIFICATION_PREFERENCES = [
  { code: 'EventPublished', inApp: true, email: true, push: false },
  { code: 'EventReminder', inApp: true, email: false, push: false },
  { code: 'IdeaStatusChanged', inApp: true, email: true, push: false },
  { code: 'RsvpApproved', inApp: true, email: true, push: false },
];

export const AUDIT_ENTRIES = [
  { id: 'a1', timestamp: '2026-06-01T09:00:00Z', actorUserId: 'admin', entityType: 'User', entityId: 'member', action: 'Update', beforeJson: '{"role":"Guest"}', afterJson: '{"role":"Member"}' },
  { id: 'a2', timestamp: '2026-06-01T10:00:00Z', actorUserId: 'lead', entityType: 'Contact', entityId: 'c1', action: 'Create', beforeJson: null, afterJson: '{"name":"Alice Johnson"}' },
  { id: 'a3', timestamp: '2026-06-02T10:00:00Z', actorUserId: 'lead', entityType: 'Event', entityId: 'ev1', action: 'Update', beforeJson: '{"status":"Draft"}', afterJson: '{"status":"Published"}' },
];

export const SESSIONS = [
  { id: 's1', device: 'Chrome on macOS', location: 'Toronto, CA', lastSeen: '2026-06-02T09:00:00Z', current: true },
  { id: 's2', device: 'Safari on iPhone', location: 'Toronto, CA', lastSeen: '2026-05-30T19:00:00Z', current: false },
];

export const NOTES: MockNote[] = [
  {
    id: 'note-1',
    subjectType: 'Contact',
    subjectId: 'c1',
    bodyMarkdown: 'Met at the **spring** outreach.',
    bodyHtmlSanitized: '<p>Met at the <strong>spring</strong> outreach.</p>',
    createdBy: 'lead',
    createdAt: '2026-05-05T10:00:00Z',
    updatedAt: '2026-05-05T10:00:00Z',
    history: [],
  },
];

export const INVITATIONS: MockInvitation[] = [
  { id: 'inv-1', email: 'new.person@example.com', firstName: 'New', lastName: 'Person', role: 'Member', city: 'toronto', status: 'Pending', token: 'inv-token-1' },
];

/** Deep-clone the seed so each test gets an isolated, mutable store. */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

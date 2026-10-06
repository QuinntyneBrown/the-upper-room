// In-browser mock of the Upper Room API. Installed on every BrowserContext by
// the `mockApi` fixture, it answers every /api/** and /__idp/** request from an
// in-memory store seeded from ./seed.ts, so the ASP.NET backend never runs.
//
// Specs that register their own page.route() for an endpoint still win:
// Playwright matches page routes before context routes, and later
// registrations before earlier ones.
import type { BrowserContext, Route } from '@playwright/test';
import { Router, json, noContent, notFound, badRequest, type Method, type MockRequest, type MockResponse } from './router';
import * as seed from './seed';

export interface RbacSeed {
  userId?: string;
  cityId?: string;
  roles?: string[];
  permissions?: string[];
}

export interface UnhandledRequest {
  method: string;
  path: string;
}

const SECURITY_HEADERS: Record<string, string> = {
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'content-security-policy': "default-src 'self'",
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
};

const NOW = '2026-06-05T12:00:00Z';
/** Password accepted by the mock sign-in endpoint for any email. */
export const CANONICAL_PASSWORD = 'Password!23456';

export class MockBackend {
  readonly users = seed.clone(seed.USERS);
  readonly cities = seed.clone(seed.CITIES);
  readonly tags = seed.clone(seed.TAGS);
  readonly contacts = seed.clone(seed.CONTACTS);
  readonly partners = seed.clone(seed.PARTNERS);
  readonly locations = seed.clone(seed.LOCATIONS);
  readonly events = seed.clone(seed.EVENTS);
  readonly ideas = seed.clone(seed.IDEAS);
  readonly boards = seed.clone(seed.BOARDS);
  readonly notifications = seed.clone(seed.NOTIFICATIONS);
  readonly notificationPreferences = seed.clone(seed.NOTIFICATION_PREFERENCES);
  readonly auditEntries = seed.clone(seed.AUDIT_ENTRIES);
  readonly sessions = seed.clone(seed.SESSIONS);
  readonly notes = seed.clone(seed.NOTES);
  readonly invitations = seed.clone(seed.INVITATIONS);
  readonly profiles: Record<string, Record<string, unknown>> = {};
  readonly rsvps: Record<string, { status: string | null; waitlistPosition: number | null }> = {};
  readonly pendingRsvps: Record<string, { id: string; userId: string; userName: string; requestedAt: string }[]> = {
    ev2: [{ id: 'req-1', userId: 'guest', userName: 'Gia Guest', requestedAt: '2026-06-01T08:00:00Z' }],
  };
  pushSubscribed = false;
  digestFrequency = 'off';

  /** Every request that reached the mock, newest last. Useful for assertions. */
  readonly requests: { method: string; path: string; body: unknown }[] = [];
  /** Requests no handler matched (answered 404). */
  readonly unhandled: UnhandledRequest[] = [];

  private counter = 1000;
  private readonly router = new Router();

  constructor() {
    this.registerRoutes();
  }

  nextId(prefix: string): string {
    this.counter += 1;
    return `${prefix}-${this.counter}`;
  }

  async install(context: BrowserContext): Promise<void> {
    await context.route(/\/(api|__idp)(\/|$)/, (route) => this.handle(route));
  }

  private async handle(route: Route): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method().toUpperCase() as Method;
    const rawBody = request.postData();
    let body: unknown = null;
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = rawBody;
      }
    }
    const headers = await request.allHeaders().catch(() => request.headers());
    this.requests.push({ method, path: url.pathname + url.search, body });

    if (method === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: SECURITY_HEADERS });
      return;
    }

    const matched = this.router.match(method, url.pathname);
    let response: MockResponse;
    if (!matched) {
      this.unhandled.push({ method, path: url.pathname });
      response = notFound();
    } else {
      const req: MockRequest = {
        method,
        path: url.pathname,
        url,
        query: url.searchParams,
        params: matched.params,
        headers,
        body,
        rawBody,
      };
      try {
        response = await matched.handler(req);
      } catch (err) {
        response = json({ code: 'MockError', message: String(err) }, 500);
      }
    }

    if (url.pathname === '/api/v1/users/me' && method === 'GET' && response.status === 200) {
      response = await this.mergeRbacSeed(route, response);
    }

    const status = response.status ?? 200;
    const fulfilHeaders: Record<string, string> = { ...SECURITY_HEADERS, ...(response.headers ?? {}) };
    if (response.body === undefined || status === 204) {
      await route.fulfill({ status, headers: fulfilHeaders });
      return;
    }
    if (typeof response.body === 'string') {
      await route.fulfill({
        status,
        headers: fulfilHeaders,
        contentType: response.contentType ?? 'text/plain',
        body: response.body,
      });
      return;
    }
    await route.fulfill({
      status,
      headers: fulfilHeaders,
      contentType: response.contentType ?? 'application/json',
      body: JSON.stringify(response.body),
    });
  }

  /**
   * Specs seed RBAC through window.__setRbac (persisted in sessionStorage as
   * __e2e_rbac). The real backend would return the user's actual roles, so the
   * mock reads the seed back and reports exactly what the spec asked for;
   * otherwise the app's me-bootstrap would overwrite the seeded snapshot.
   */
  private async mergeRbacSeed(route: Route, response: MockResponse): Promise<MockResponse> {
    let rbac: RbacSeed | null = null;
    try {
      const page = route.request().frame().page();
      rbac = await page.evaluate(() => {
        const raw = window.sessionStorage.getItem('__e2e_rbac');
        return raw ? (JSON.parse(raw) as RbacSeed) : null;
      });
    } catch {
      rbac = null;
    }
    if (!rbac) return response;
    const me = response.body as Record<string, unknown>;
    return {
      ...response,
      body: {
        ...me,
        id: rbac.userId ?? me['id'],
        city: rbac.cityId ?? me['city'],
        roles: rbac.roles ?? me['roles'],
        permissions: rbac.permissions ?? me['permissions'],
      },
    };
  }

  // ---------------------------------------------------------------- helpers

  private pendingSignIn = 'lead';

  userFromRequest(req: MockRequest): seed.MockUser | null {
    const auth = req.headers['authorization'] ?? '';
    const match = /^Bearer\s+(.+)$/i.exec(auth);
    if (!match) return null;
    const token = match[1].trim();
    const id = token.replace(/-token$/, '');
    return this.users.find((u) => u.id === id) ?? this.users.find((u) => u.id === 'lead') ?? null;
  }

  meFor(user: seed.MockUser): Record<string, unknown> {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      city: user.city,
      roles: [user.role],
      permissions: seed.ROLE_PERMISSIONS[user.role] ?? [],
      theme: user.theme ?? 'system',
    };
  }

  private requireUser(req: MockRequest): seed.MockUser | MockResponse {
    const user = this.userFromRequest(req);
    return user ?? json({ code: 'Unauthorized', message: 'Unauthorized' }, 401);
  }

  private isResponse(x: unknown): x is MockResponse {
    return typeof x === 'object' && x !== null && 'status' in x && !('id' in x);
  }

  private paged<T>(items: T[], query: URLSearchParams, pageKey = 'page', sizeKey = 'size', defaultSize = 20) {
    const page = Math.max(1, Number(query.get(pageKey) ?? '1'));
    const size = Math.max(1, Number(query.get(sizeKey) ?? query.get('pageSize') ?? String(defaultSize)));
    const start = (page - 1) * size;
    return { items: items.slice(start, start + size), total: items.length, page, pageSize: size };
  }

  private contactDto(c: seed.MockContact) {
    return c;
  }

  private partnerDto(p: seed.MockPartner) {
    const { contacts, ...rest } = p;
    return { ...rest, contactCount: contacts.length };
  }

  private eventListDto(e: seed.MockEvent) {
    const { attendees: _a, description: _d, requiresApproval: _r, organizerId: _o, ...rest } = e;
    return rest;
  }

  private boardSummary(b: seed.MockBoard) {
    return {
      id: b.id,
      name: b.name,
      description: b.description,
      columnCount: b.columns.length,
      cardCount: b.cards.filter((c) => !c.archived).length,
      lastActivityAt: b.lastActivityAt,
    };
  }

  private renderMarkdown(md: string): string {
    const escaped = md
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>');
    return `<p>${escaped}</p>`;
  }

  // ----------------------------------------------------------------- routes

  private registerRoutes(): void {
    const r = this.router;

    r.get('/api/v1/health', () => json({ status: 'ok' }));

    // ---- auth / identity provider -------------------------------------
    r.post('/__idp/authorize', (req) => {
      const body = (req.body ?? {}) as { email?: string; password?: string; codeChallenge?: string };
      if (!body.codeChallenge) return badRequest('idp.code_challenge_required');
      if (!body.email || body.password !== CANONICAL_PASSWORD) {
        return json({ code: 'auth.invalid_credentials' }, 401);
      }
      const user = this.users.find((u) => u.email === body.email);
      this.pendingSignIn = user?.id ?? 'lead';
      return json({ code: 'mock-auth-code' });
    });
    r.post('/api/v1/auth/exchange', (req) => {
      const body = (req.body ?? {}) as { code?: string; codeVerifier?: string };
      if (!body.code || !body.codeVerifier) return badRequest('InvalidExchange');
      return json({ accessToken: `${this.pendingSignIn}-token` });
    });
    r.post('/api/v1/auth/sign-in', (req) => {
      // Any email signs in with the suite's canonical password; seeded users
      // get their own token, everyone else signs in as the city lead.
      const body = (req.body ?? {}) as { email?: string; password?: string };
      if (!body.email || body.password !== CANONICAL_PASSWORD) {
        return json({ code: 'auth.invalid_credentials' }, 401);
      }
      const user = this.users.find((u) => u.email === body.email);
      return json({ accessToken: `${user?.id ?? 'lead'}-token` });
    });
    r.post('/api/v1/auth/sign-out', () => noContent());
    r.post('/api/v1/auth/sign-up', (req) => {
      const body = (req.body ?? {}) as { email?: string };
      if (this.users.some((u) => u.email === body.email)) {
        return json({ code: 'EmailTaken', message: 'Email already in use.' }, 409);
      }
      return json({ id: this.nextId('user'), email: body.email }, 201);
    });
    r.post('/api/v1/auth/verify-email', (req) => {
      const body = (req.body ?? {}) as { token?: string };
      if (!body.token || body.token === 'expired') return badRequest('TokenExpired', 'Link expired');
      return noContent();
    });
    r.post('/api/v1/auth/verify-email/resend', () => noContent());
    r.post('/api/v1/auth/forgot-password', () => noContent());
    r.post('/api/v1/auth/reset-password', (req) => {
      const body = (req.body ?? {}) as { token?: string };
      if (!body.token || body.token === 'expired') return badRequest('TokenExpired', 'Link expired');
      return noContent();
    });
    r.get('/api/v1/auth/me', (req) => {
      const user = this.requireUser(req);
      if (this.isResponse(user)) return user;
      return json({ userId: user.id, currentUserId: user.id });
    });

    // ---- me / profile / sessions ---------------------------------------
    r.get('/api/v1/users/me', (req) => {
      const user = this.requireUser(req);
      if (this.isResponse(user)) return user;
      return json(this.meFor(user));
    });
    r.patch('/api/v1/users/me', (req) => {
      const user = this.requireUser(req);
      if (this.isResponse(user)) return user;
      const body = (req.body ?? {}) as { theme?: string };
      if (body.theme) user.theme = body.theme;
      return json(this.meFor(user));
    });
    r.get('/api/v1/users/me/profile', (req) => {
      const user = this.requireUser(req);
      if (this.isResponse(user)) return user;
      return json(this.profileFor(user));
    });
    r.put('/api/v1/users/me/profile', (req) => {
      const user = this.requireUser(req);
      if (this.isResponse(user)) return user;
      const body = (req.body ?? {}) as Record<string, unknown>;
      this.profiles[user.id] = { ...this.profileFor(user), ...body };
      return json(this.profiles[user.id]);
    });
    r.patch('/api/v1/users/me/profile', (req) => {
      const user = this.requireUser(req);
      if (this.isResponse(user)) return user;
      const body = (req.body ?? {}) as Record<string, unknown>;
      this.profiles[user.id] = { ...this.profileFor(user), ...body };
      return json(this.profiles[user.id]);
    });
    r.get('/api/v1/users/me/sessions', () => json({ items: this.sessions }));
    r.post('/api/v1/users/me/sessions/revoke-others', () => {
      const current = this.sessions.filter((s) => s.current);
      this.sessions.splice(0, this.sessions.length, ...current);
      return noContent();
    });

    // ---- users admin / invitations -------------------------------------
    r.get('/api/v1/users', (req) => {
      const search = (req.query.get('search') ?? '').toLowerCase();
      const role = req.query.get('role');
      let rows = this.users.map((u) => this.userRow(u));
      if (search) rows = rows.filter((u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
      if (role && role !== 'All') rows = rows.filter((u) => u.role === role);
      return json(this.paged(rows, req.query, 'page', 'pageSize', 25));
    });
    r.get('/api/v1/users/:id', (req) => {
      const u = this.users.find((x) => x.id === req.params['id']);
      return u ? json(this.userRow(u)) : notFound();
    });
    r.patch('/api/v1/users/:id', (req) => {
      const u = this.users.find((x) => x.id === req.params['id']);
      if (!u) return notFound();
      const body = (req.body ?? {}) as { role?: string };
      if (body.role) u.role = body.role;
      return json(this.userRow(u));
    });
    r.post('/api/v1/users/:id/disable', (req) => {
      const u = this.users.find((x) => x.id === req.params['id']);
      if (!u) return notFound();
      u.status = 'Disabled';
      return json(this.userRow(u));
    });
    r.get('/api/v1/invitations', (req) => {
      const token = req.query.get('token');
      if (token) {
        const inv = this.invitations.find((i) => i.token === token);
        return inv ? json(inv) : notFound('InvitationNotFound');
      }
      return json({ items: this.invitations, total: this.invitations.length });
    });
    r.post('/api/v1/invitations', (req) => {
      const body = (req.body ?? {}) as Record<string, string>;
      if (this.users.some((u) => u.email === body['email'])) {
        return json({ code: 'EmailTaken', message: 'Email already in use.' }, 409);
      }
      const inv: seed.MockInvitation = {
        id: this.nextId('inv'),
        email: body['email'] ?? '',
        firstName: body['firstName'] ?? '',
        lastName: body['lastName'] ?? '',
        role: body['role'] ?? 'Member',
        city: body['city'] ?? 'toronto',
        status: 'Pending',
        token: this.nextId('inv-token'),
        message: body['message'],
      };
      this.invitations.push(inv);
      return json({ id: inv.id }, 201);
    });
    r.delete('/api/v1/invitations/:id', (req) => {
      const idx = this.invitations.findIndex((i) => i.id === req.params['id']);
      if (idx < 0) return notFound();
      this.invitations.splice(idx, 1);
      return noContent();
    });

    // ---- dashboard -------------------------------------------------------
    r.get('/api/v1/dashboard', (req) => {
      const user = this.requireUser(req);
      if (this.isResponse(user)) return user;
      return json({
        firstName: user.firstName,
        stats: {
          contacts: this.contacts.filter((c) => !c.archived).length,
          partners: this.partners.filter((p) => !p.archived).length,
          upcomingEvents: this.events.filter((e) => e.status === 'Published').length,
          openIdeas: this.ideas.filter((i) => i.status !== 'Archived' && i.status !== 'Completed').length,
        },
        upcomingEvents: this.events
          .filter((e) => e.status === 'Published')
          .map((e) => ({ id: e.id, title: e.title, startAt: e.startAt, location: e.location })),
        recentActivity: [],
        myIdeas: this.ideas.filter((i) => i.proposedBy === user.id).map((i) => ({ id: i.id, title: i.title, status: i.status })),
        tasksOnMyBoards: this.boards.map((b) => ({
          boardId: b.id,
          boardTitle: b.name,
          cards: b.cards.filter((c) => !c.archived).slice(0, 3).map((c) => ({ id: c.id, title: c.title })),
        })),
      });
    });

    // ---- cities ----------------------------------------------------------
    r.get('/api/v1/cities', () => json({ items: this.cities, total: this.cities.length }));
    r.post('/api/v1/cities', (req) => {
      const body = (req.body ?? {}) as { name?: string; slug?: string; country?: string };
      const slug = body.slug ?? slugify(body.name ?? '');
      if (!body.name) return badRequest('NameRequired', 'Name is required');
      if (this.cities.some((c) => c.slug === slug)) return json({ code: 'SlugTaken', message: 'A city with this slug already exists.' }, 409);
      const city = { id: slug, name: body.name, slug, country: body.country ?? 'CA', archived: false, members: 0 };
      this.cities.push(city);
      return json(city, 201);
    });
    r.post('/api/v1/cities/:slug/archive', (req) => {
      const c = this.cities.find((x) => x.slug === req.params['slug']);
      if (!c) return notFound();
      c.archived = true;
      return json(c);
    });

    // ---- tags ------------------------------------------------------------
    r.get('/api/v1/tags', (req) => {
      const search = (req.query.get('search') ?? '').toLowerCase();
      const items = search ? this.tags.filter((t) => t.name.toLowerCase().includes(search)) : this.tags;
      return json({ items, total: items.length });
    });
    r.post('/api/v1/tags', (req) => {
      const body = (req.body ?? {}) as { name?: string; color?: string };
      const name = (body.name ?? '').trim();
      if (!name) return badRequest('NameRequired', 'Name is required');
      if (this.tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
        return json({ code: 'DuplicateTag', message: 'A tag with this name already exists.' }, 409);
      }
      const tag = { id: this.nextId('tag'), name, color: body.color ?? 'blue' };
      this.tags.push(tag);
      return json(tag, 201);
    });
    r.patch('/api/v1/tags/:id', (req) => {
      const t = this.tags.find((x) => x.id === req.params['id']);
      if (!t) return notFound();
      Object.assign(t, req.body ?? {});
      return json(t);
    });
    r.delete('/api/v1/tags/:id', (req) => {
      const idx = this.tags.findIndex((x) => x.id === req.params['id']);
      if (idx < 0) return notFound();
      this.tags.splice(idx, 1);
      return noContent();
    });

    // ---- contacts --------------------------------------------------------
    r.get('/api/v1/contacts', (req) => {
      const search = (req.query.get('search') ?? '').toLowerCase();
      const includeArchived = req.query.get('includeArchived') === 'true' || req.query.get('archived') === 'true';
      const scope = req.query.get('scope');
      let items = this.contacts.filter((c) => includeArchived || !c.archived);
      if (scope && scope !== '*') items = items.filter((c) => c.cityId === scope);
      if (search) {
        items = items.filter(
          (c) =>
            c.name.toLowerCase().includes(search) ||
            (c.org ?? '').toLowerCase().includes(search) ||
            c.emails.some((e) => e.value.toLowerCase().includes(search)),
        );
      }
      return json(this.paged(items.map((c) => this.contactDto(c)), req.query));
    });
    r.post('/api/v1/contacts', (req) => {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const name = String(body['name'] ?? '').trim();
      if (!name) return badRequest('NameRequired', 'Name is required');
      const contact = {
        id: this.nextId('c'),
        cityId: 'toronto',
        phones: [],
        emails: [],
        tags: [],
        archived: false,
        ...body,
        name,
      } as seed.MockContact;
      this.contacts.push(contact);
      return json(contact, 201);
    });
    r.get('/api/v1/contacts/:id', (req) => {
      const c = this.contacts.find((x) => x.id === req.params['id']);
      return c ? json(this.contactDto(c)) : notFound();
    });
    for (const method of ['PUT', 'PATCH'] as const) {
      r.on(method, '/api/v1/contacts/:id', (req) => {
        const c = this.contacts.find((x) => x.id === req.params['id']);
        if (!c) return notFound();
        Object.assign(c, req.body ?? {});
        return json(this.contactDto(c));
      });
    }
    r.delete('/api/v1/contacts/:id', (req) => {
      const idx = this.contacts.findIndex((x) => x.id === req.params['id']);
      if (idx < 0) return notFound();
      this.contacts.splice(idx, 1);
      return noContent();
    });
    r.post('/api/v1/contacts/:id/archive', (req) => {
      const c = this.contacts.find((x) => x.id === req.params['id']);
      if (!c) return notFound();
      c.archived = true;
      return json(this.contactDto(c));
    });
    r.post('/api/v1/contacts/:id/unarchive', (req) => {
      const c = this.contacts.find((x) => x.id === req.params['id']);
      if (!c) return notFound();
      c.archived = false;
      return json(this.contactDto(c));
    });

    // ---- partners --------------------------------------------------------
    r.get('/api/v1/partners', (req) => {
      const search = (req.query.get('search') ?? '').toLowerCase();
      const archived = req.query.get('archived') === 'true';
      let items = this.partners.filter((p) => archived || !p.archived);
      if (search) items = items.filter((p) => p.name.toLowerCase().includes(search));
      return json({ items: items.map((p) => this.partnerDto(p)), total: items.length });
    });
    r.post('/api/v1/partners', (req) => {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const name = String(body['name'] ?? '').trim();
      if (!name) return badRequest('NameRequired', 'Name is required');
      const partner = {
        id: this.nextId('p'),
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
        ...body,
        name,
      } as seed.MockPartner;
      this.partners.push(partner);
      return json(this.partnerDto(partner), 201);
    });
    r.get('/api/v1/partners/:id', (req) => {
      const p = this.partners.find((x) => x.id === req.params['id']);
      return p ? json(this.partnerDto(p)) : notFound();
    });
    for (const method of ['PUT', 'PATCH'] as const) {
      r.on(method, '/api/v1/partners/:id', (req) => {
        const p = this.partners.find((x) => x.id === req.params['id']);
        if (!p) return notFound();
        Object.assign(p, req.body ?? {});
        return json(this.partnerDto(p));
      });
    }
    r.delete('/api/v1/partners/:id', (req) => {
      const idx = this.partners.findIndex((x) => x.id === req.params['id']);
      if (idx < 0) return notFound();
      this.partners.splice(idx, 1);
      return noContent();
    });
    r.get('/api/v1/partners/:id/contacts', (req) => {
      const p = this.partners.find((x) => x.id === req.params['id']);
      if (!p) return notFound();
      const items = p.contacts.map((id) => this.contacts.find((c) => c.id === id)).filter(Boolean);
      return json({ items, total: items.length });
    });
    r.post('/api/v1/partners/:id/contacts', (req) => {
      const p = this.partners.find((x) => x.id === req.params['id']);
      if (!p) return notFound();
      const body = (req.body ?? {}) as { contactId?: string };
      if (body.contactId && !p.contacts.includes(body.contactId)) p.contacts.push(body.contactId);
      return json(this.partnerDto(p), 201);
    });
    r.delete('/api/v1/partners/:id/contacts/:contactId', (req) => {
      const p = this.partners.find((x) => x.id === req.params['id']);
      if (!p) return notFound();
      const idx = p.contacts.indexOf(req.params['contactId']);
      if (idx >= 0) p.contacts.splice(idx, 1);
      return noContent();
    });

    // ---- locations -------------------------------------------------------
    r.get('/api/v1/locations', (req) => {
      const search = (req.query.get('search') ?? '').toLowerCase();
      const items = search ? this.locations.filter((l) => l.name.toLowerCase().includes(search)) : this.locations;
      return json({ items, total: items.length });
    });
    r.post('/api/v1/locations', (req) => {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const name = String(body['name'] ?? '').trim();
      if (!name) return badRequest('NameRequired', 'Name is required');
      const loc = {
        id: this.nextId('loc'),
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        capacity: null,
        lat: null,
        lng: null,
        archived: false,
        photos: [],
        eventCount: 0,
        ...body,
        name,
      } as seed.MockLocation;
      this.locations.push(loc);
      return json(loc, 201);
    });
    r.get('/api/v1/locations/:id', (req) => {
      const l = this.locations.find((x) => x.id === req.params['id']);
      return l ? json(l) : notFound();
    });
    for (const method of ['PUT', 'PATCH'] as const) {
      r.on(method, '/api/v1/locations/:id', (req) => {
        const l = this.locations.find((x) => x.id === req.params['id']);
        if (!l) return notFound();
        Object.assign(l, req.body ?? {});
        return json(l);
      });
    }
    r.delete('/api/v1/locations/:id', (req) => {
      const idx = this.locations.findIndex((x) => x.id === req.params['id']);
      if (idx < 0) return notFound();
      this.locations.splice(idx, 1);
      return noContent();
    });
    r.post('/api/v1/locations/:id/photos', (req) => {
      const l = this.locations.find((x) => x.id === req.params['id']);
      if (!l) return notFound();
      l.photos.push(`/uploads/${this.nextId('photo')}.jpg`);
      return json(l, 201);
    });

    // ---- events ----------------------------------------------------------
    r.get('/api/v1/events', (req) => {
      const status = req.query.get('status');
      const month = req.query.get('month');
      let items = this.events;
      if (status) items = items.filter((e) => e.status === status);
      if (month) items = items.filter((e) => e.startAt.startsWith(month));
      return json({ items: items.map((e) => this.eventListDto(e)), total: items.length });
    });
    r.post('/api/v1/events', (req) => {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const title = String(body['title'] ?? '').trim();
      if (!title) return badRequest('TitleRequired', 'Title is required');
      const ev = {
        id: this.nextId('ev'),
        coverImageUrl: null,
        status: 'Draft',
        startAt: NOW,
        endAt: NOW,
        location: null,
        isVirtual: false,
        rsvpCount: 0,
        capacity: null,
        tags: [],
        description: null,
        attendees: [],
        requiresApproval: false,
        recurrenceRule: null,
        recurrenceId: null,
        occurrenceDate: null,
        timezone: 'America/Toronto',
        organizerId: this.userFromRequest(req)?.id ?? 'lead',
        ...body,
        title,
      } as seed.MockEvent;
      this.events.push(ev);
      return json(ev, 201);
    });
    r.get('/api/v1/events/:id', (req) => {
      const e = this.events.find((x) => x.id === req.params['id']);
      return e ? json(e) : notFound();
    });
    for (const method of ['PUT', 'PATCH'] as const) {
      r.on(method, '/api/v1/events/:id', (req) => {
        const e = this.events.find((x) => x.id === req.params['id']);
        if (!e) return notFound();
        Object.assign(e, req.body ?? {});
        return json(e);
      });
    }
    r.delete('/api/v1/events/:id', (req) => {
      const idx = this.events.findIndex((x) => x.id === req.params['id']);
      if (idx < 0) return notFound();
      this.events.splice(idx, 1);
      return noContent();
    });
    r.get('/api/v1/events/:id/ics', (req) => {
      const e = this.events.find((x) => x.id === req.params['id']);
      if (!e) return notFound();
      const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', `UID:${e.id}`, `SUMMARY:${e.title}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      return { status: 200, body: ics, contentType: 'text/calendar', headers: { 'content-disposition': `attachment; filename="${e.id}.ics"` } };
    });
    r.get('/api/v1/events/:id/rsvp', (req) => {
      const current = this.rsvps[req.params['id']] ?? { status: null, waitlistPosition: null };
      return json({ rsvpStatus: current.status, waitlistPosition: current.waitlistPosition });
    });
    r.post('/api/v1/events/:id/rsvp', (req) => {
      const e = this.events.find((x) => x.id === req.params['id']);
      if (!e) return notFound();
      const body = (req.body ?? {}) as { status?: string };
      const status = body.status ?? 'Going';
      if (status === 'Going' && e.capacity !== null && e.rsvpCount >= e.capacity) {
        this.rsvps[e.id] = { status: 'Waitlisted', waitlistPosition: 1 };
        return json({ rsvpStatus: 'Waitlisted', waitlistPosition: 1 });
      }
      this.rsvps[e.id] = { status, waitlistPosition: null };
      return json({ rsvpStatus: status, waitlistPosition: null });
    });
    r.get('/api/v1/events/:id/rsvp/requests', (req) => json({ items: this.pendingRsvps[req.params['id']] ?? [] }));
    r.post('/api/v1/events/:id/rsvp/requests/:requestId/approve', (req) => {
      const list = this.pendingRsvps[req.params['id']] ?? [];
      const idx = list.findIndex((p) => p.id === req.params['requestId']);
      if (idx >= 0) list.splice(idx, 1);
      return noContent();
    });
    r.post('/api/v1/events/:id/rsvp/requests/:requestId/deny', (req) => {
      const list = this.pendingRsvps[req.params['id']] ?? [];
      const idx = list.findIndex((p) => p.id === req.params['requestId']);
      if (idx >= 0) list.splice(idx, 1);
      return noContent();
    });
    r.post('/api/v1/events/:id/cancel', (req) => {
      const e = this.events.find((x) => x.id === req.params['id']);
      if (!e) return notFound();
      e.status = 'Cancelled';
      return json({ status: 'Cancelled' });
    });

    // ---- ideas -----------------------------------------------------------
    r.get('/api/v1/ideas', (req) => {
      const user = this.userFromRequest(req);
      const mine = req.query.get('myIdeas') === 'true';
      const sort = req.query.get('sort') ?? 'newest';
      let items = [...this.ideas];
      if (mine && user) items = items.filter((i) => i.proposedBy === user.id);
      if (sort === 'votes' || sort === 'mostVoted') items.sort((a, b) => b.voteCount - a.voteCount);
      else items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return json({ items: items.map((i) => this.ideaDto(i)), total: items.length });
    });
    r.post('/api/v1/ideas', (req) => {
      const user = this.userFromRequest(req);
      const body = (req.body ?? {}) as Record<string, unknown>;
      const title = String(body['title'] ?? '').trim();
      if (!title) return badRequest('TitleRequired', 'Title is required');
      const md = String(body['bodyMarkdown'] ?? body['description'] ?? '');
      const idea = {
        id: this.nextId('idea'),
        description: md,
        bodyMarkdown: md,
        bodyHtmlSanitized: this.renderMarkdown(md),
        coverImageUrl: null,
        status: 'Submitted',
        voteCount: 0,
        hasVoted: false,
        proposedBy: user?.id ?? 'lead',
        createdAt: NOW,
        updatedAt: NOW,
        tags: [],
        linkedPartners: [],
        comments: [],
        ...body,
        title,
      } as seed.MockIdea;
      this.ideas.push(idea);
      return json(this.ideaDto(idea), 201);
    });
    r.get('/api/v1/ideas/:id', (req) => {
      const i = this.ideas.find((x) => x.id === req.params['id']);
      return i ? json(this.ideaDto(i)) : notFound();
    });
    for (const method of ['PUT', 'PATCH'] as const) {
      r.on(method, '/api/v1/ideas/:id', (req) => {
        const i = this.ideas.find((x) => x.id === req.params['id']);
        if (!i) return notFound();
        const body = (req.body ?? {}) as Record<string, unknown>;
        Object.assign(i, body);
        if (typeof body['bodyMarkdown'] === 'string') i.bodyHtmlSanitized = this.renderMarkdown(body['bodyMarkdown']);
        i.updatedAt = NOW;
        return json(this.ideaDto(i));
      });
    }
    r.delete('/api/v1/ideas/:id', (req) => {
      const idx = this.ideas.findIndex((x) => x.id === req.params['id']);
      if (idx < 0) return notFound();
      this.ideas.splice(idx, 1);
      return noContent();
    });
    r.post('/api/v1/ideas/:id/vote', (req) => {
      const i = this.ideas.find((x) => x.id === req.params['id']);
      if (!i) return notFound();
      i.hasVoted = !i.hasVoted;
      i.voteCount += i.hasVoted ? 1 : -1;
      return json(this.ideaDto(i));
    });
    r.post('/api/v1/ideas/:id/status', (req) => {
      const i = this.ideas.find((x) => x.id === req.params['id']);
      if (!i) return notFound();
      const body = (req.body ?? {}) as { status?: string };
      if (body.status) i.status = body.status;
      return json(this.ideaDto(i));
    });
    r.post('/api/v1/ideas/:id/cover', (req) => {
      const i = this.ideas.find((x) => x.id === req.params['id']);
      if (!i) return notFound();
      i.coverImageUrl = `/uploads/${this.nextId('cover')}.jpg`;
      return json(this.ideaDto(i));
    });
    r.get('/api/v1/ideas/:id/partners', (req) => {
      const i = this.ideas.find((x) => x.id === req.params['id']);
      return json({ items: i?.linkedPartners ?? [] });
    });
    r.post('/api/v1/ideas/:id/partners', (req) => {
      const i = this.ideas.find((x) => x.id === req.params['id']);
      if (!i) return notFound();
      const body = (req.body ?? {}) as { partnerId?: string };
      const p = this.partners.find((x) => x.id === body.partnerId);
      if (!p) return notFound('PartnerNotFound');
      if (!i.linkedPartners.some((lp) => lp.id === p.id)) i.linkedPartners.push({ id: p.id, name: p.name });
      return json({ items: i.linkedPartners }, 201);
    });
    r.delete('/api/v1/ideas/:id/partners/:partnerId', (req) => {
      const i = this.ideas.find((x) => x.id === req.params['id']);
      if (!i) return notFound();
      const idx = i.linkedPartners.findIndex((lp) => lp.id === req.params['partnerId']);
      if (idx >= 0) i.linkedPartners.splice(idx, 1);
      return noContent();
    });
    r.get('/api/v1/ideas/:id/comments', (req) => {
      const i = this.ideas.find((x) => x.id === req.params['id']);
      return json({ items: i?.comments ?? [] });
    });
    r.post('/api/v1/ideas/:id/comments', (req) => {
      const i = this.ideas.find((x) => x.id === req.params['id']);
      if (!i) return notFound();
      const user = this.userFromRequest(req);
      const body = (req.body ?? {}) as { body?: string };
      const comment = { id: this.nextId('comment'), ideaId: i.id, body: body.body ?? '', author: user ? `${user.firstName} ${user.lastName}` : 'Anonymous', createdAt: NOW };
      i.comments.push(comment);
      return json(comment, 201);
    });

    // ---- kanban ----------------------------------------------------------
    r.get('/api/v1/boards', () => json({ items: this.boards.map((b) => this.boardSummary(b)), total: this.boards.length }));
    r.post('/api/v1/boards', (req) => {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const name = String(body['name'] ?? '').trim();
      if (!name) return badRequest('NameRequired', 'Name is required');
      const columns = Array.isArray(body['columns'])
        ? (body['columns'] as { name: string; color?: string; wipLimit?: number }[]).map((c) => ({ id: this.nextId('col'), color: 'blue', ...c }))
        : [
            { id: this.nextId('col'), name: 'To Do', color: 'blue' },
            { id: this.nextId('col'), name: 'Doing', color: 'orange' },
            { id: this.nextId('col'), name: 'Done', color: 'green' },
          ];
      const board = {
        id: this.nextId('board'),
        name,
        description: (body['description'] as string | null) ?? null,
        columns,
        cards: [],
        cardSchema: (body['cardSchema'] as never[]) ?? [],
        swimlaneMode: (body['swimlaneMode'] as string) ?? 'None',
        lastActivityAt: NOW,
      } as seed.MockBoard;
      this.boards.push(board);
      return json({ ...this.boardSummary(board), columns: board.columns, cards: [] }, 201);
    });
    r.get('/api/v1/boards/:id', (req) => {
      const b = this.boards.find((x) => x.id === req.params['id']);
      return b ? json(b) : notFound();
    });
    for (const method of ['PUT', 'PATCH'] as const) {
      r.on(method, '/api/v1/boards/:id', (req) => {
        const b = this.boards.find((x) => x.id === req.params['id']);
        if (!b) return notFound();
        Object.assign(b, req.body ?? {});
        return json(b);
      });
    }
    r.delete('/api/v1/boards/:id', (req) => {
      const idx = this.boards.findIndex((x) => x.id === req.params['id']);
      if (idx < 0) return notFound();
      this.boards.splice(idx, 1);
      return noContent();
    });
    r.post('/api/v1/boards/:id/cards', (req) => {
      const b = this.boards.find((x) => x.id === req.params['id']);
      if (!b) return notFound();
      const body = (req.body ?? {}) as Record<string, unknown>;
      const column = b.columns.find((c) => c.id === body['columnId']) ?? b.columns[0];
      const count = b.cards.filter((c) => c.columnId === column.id && !c.archived).length;
      if (column.wipLimit !== undefined && count >= column.wipLimit) {
        return json({ code: 'WipLimitExceeded', message: `Column "${column.name}" is at its WIP limit.` }, 409);
      }
      const card = {
        id: this.nextId('card'),
        columnId: column.id,
        title: String(body['title'] ?? 'Untitled'),
        tags: [],
        assigneeName: null,
        dueDate: null,
        swimlaneKey: null,
        archived: false,
        data: {},
        ...body,
      } as seed.MockCard;
      b.cards.push(card);
      return json(card, 201);
    });
    r.patch('/api/v1/boards/:id/schema', (req) => {
      const b = this.boards.find((x) => x.id === req.params['id']);
      if (!b) return notFound();
      const body = (req.body ?? {}) as { fields?: seed.MockBoard['cardSchema'] };
      b.cardSchema = body.fields ?? [];
      return json(b);
    });
    r.post('/api/v1/boards/:id/columns', (req) => {
      const b = this.boards.find((x) => x.id === req.params['id']);
      if (!b) return notFound();
      const body = (req.body ?? {}) as { name?: string; color?: string; wipLimit?: number };
      const column = { id: this.nextId('col'), name: body.name ?? 'New column', color: body.color ?? 'blue', ...(body.wipLimit !== undefined ? { wipLimit: body.wipLimit } : {}) };
      b.columns.push(column);
      return json(column, 201);
    });
    r.post('/api/v1/boards/:id/columns/order', (req) => {
      const b = this.boards.find((x) => x.id === req.params['id']);
      if (!b) return notFound();
      const body = (req.body ?? {}) as { order?: string[] };
      if (Array.isArray(body.order)) {
        b.columns.sort((x, y) => body.order!.indexOf(x.id) - body.order!.indexOf(y.id));
      }
      return json(b);
    });
    r.patch('/api/v1/boards/:id/columns/:columnId', (req) => {
      const b = this.boards.find((x) => x.id === req.params['id']);
      if (!b) return notFound();
      const col = b.columns.find((c) => c.id === req.params['columnId']);
      if (!col) return notFound();
      Object.assign(col, req.body ?? {});
      return json(col);
    });
    r.delete('/api/v1/boards/:id/columns/:columnId', (req) => {
      const b = this.boards.find((x) => x.id === req.params['id']);
      if (!b) return notFound();
      const idx = b.columns.findIndex((c) => c.id === req.params['columnId']);
      if (idx < 0) return notFound();
      const body = (req.body ?? {}) as { moveCardsTo?: string };
      const removed = b.columns.splice(idx, 1)[0];
      const target = body.moveCardsTo ?? b.columns[0]?.id;
      for (const card of b.cards) if (card.columnId === removed.id && target) card.columnId = target;
      return noContent();
    });
    r.patch('/api/v1/cards/:id', (req) => {
      for (const b of this.boards) {
        const card = b.cards.find((c) => c.id === req.params['id']);
        if (card) {
          Object.assign(card, req.body ?? {});
          return json(card);
        }
      }
      return notFound();
    });
    r.delete('/api/v1/cards/:id', (req) => {
      for (const b of this.boards) {
        const idx = b.cards.findIndex((c) => c.id === req.params['id']);
        if (idx >= 0) {
          b.cards.splice(idx, 1);
          return noContent();
        }
      }
      return notFound();
    });
    r.post('/api/v1/cards/:id/move', (req) => {
      const body = (req.body ?? {}) as { columnId?: string; toColumnId?: string; position?: number };
      for (const b of this.boards) {
        const card = b.cards.find((c) => c.id === req.params['id']);
        if (!card) continue;
        const target = body.columnId ?? body.toColumnId;
        const column = b.columns.find((c) => c.id === target);
        if (!column) return notFound('ColumnNotFound');
        const count = b.cards.filter((c) => c.columnId === column.id && !c.archived && c.id !== card.id).length;
        if (column.wipLimit !== undefined && count >= column.wipLimit) {
          return json({ code: 'WipLimitExceeded', message: `Column "${column.name}" is at its WIP limit.` }, 409);
        }
        card.columnId = column.id;
        return json(card);
      }
      return notFound();
    });

    // ---- notes -----------------------------------------------------------
    r.get('/api/v1/notes', (req) => {
      const subjectType = req.query.get('subjectType');
      const subjectId = req.query.get('subjectId');
      const items = this.notes.filter((n) => (!subjectType || n.subjectType === subjectType) && (!subjectId || n.subjectId === subjectId));
      return json({ items, total: items.length });
    });
    r.post('/api/v1/notes', (req) => {
      const user = this.userFromRequest(req);
      const body = (req.body ?? {}) as { subjectType?: string; subjectId?: string; bodyMarkdown?: string };
      const md = body.bodyMarkdown ?? '';
      const note = {
        id: this.nextId('note'),
        subjectType: body.subjectType ?? '',
        subjectId: body.subjectId ?? '',
        bodyMarkdown: md,
        bodyHtmlSanitized: this.renderMarkdown(md),
        createdBy: user?.id ?? 'lead',
        createdAt: NOW,
        updatedAt: NOW,
        history: [],
      };
      this.notes.push(note);
      return json(note, 201);
    });
    for (const method of ['PUT', 'PATCH'] as const) {
      r.on(method, '/api/v1/notes/:id', (req) => {
        const n = this.notes.find((x) => x.id === req.params['id']);
        if (!n) return notFound();
        const body = (req.body ?? {}) as { bodyMarkdown?: string };
        n.history.unshift({ id: this.nextId('rev'), bodyMarkdown: n.bodyMarkdown, bodyHtmlSanitized: n.bodyHtmlSanitized, createdAt: n.updatedAt, createdBy: n.createdBy });
        if (typeof body.bodyMarkdown === 'string') {
          n.bodyMarkdown = body.bodyMarkdown;
          n.bodyHtmlSanitized = this.renderMarkdown(body.bodyMarkdown);
        }
        n.updatedAt = NOW;
        return json(n);
      });
    }
    r.get('/api/v1/notes/:id', (req) => {
      const n = this.notes.find((x) => x.id === req.params['id']);
      return n ? json(n) : notFound();
    });
    r.delete('/api/v1/notes/:id', (req) => {
      const idx = this.notes.findIndex((x) => x.id === req.params['id']);
      if (idx < 0) return notFound();
      this.notes.splice(idx, 1);
      return noContent();
    });

    // ---- notifications / push -------------------------------------------
    r.get('/api/v1/notifications', () => json({ items: this.notifications, total: this.notifications.length, unread: this.notifications.filter((n) => !n.read).length }));
    r.post('/api/v1/notifications/read-all', () => {
      for (const n of this.notifications) n.read = true;
      return noContent();
    });
    r.post('/api/v1/notifications/:id/read', (req) => {
      const n = this.notifications.find((x) => x.id === req.params['id']);
      if (!n) return notFound();
      n.read = true;
      return json(n);
    });
    r.get('/api/v1/notifications/preferences', () => json(this.notificationPreferences));
    r.put('/api/v1/notifications/preferences', (req) => {
      const body = req.body as { code?: string; inApp?: boolean; email?: boolean; push?: boolean } | { items?: unknown[] } | null;
      if (body && 'code' in body && body.code) {
        const pref = this.notificationPreferences.find((p) => p.code === body.code);
        if (pref) Object.assign(pref, body);
      }
      return json(this.notificationPreferences);
    });
    r.get('/api/v1/notifications/digest', () => json({ digestFrequency: this.digestFrequency }));
    r.put('/api/v1/notifications/digest', (req) => {
      const body = (req.body ?? {}) as { digestFrequency?: string };
      if (body.digestFrequency) this.digestFrequency = body.digestFrequency;
      return json({ digestFrequency: this.digestFrequency });
    });
    r.get('/api/v1/push/vapid-public-key', () => ({ status: 200, body: 'BMockVapidPublicKey', contentType: 'text/plain' }));
    r.post('/api/v1/push/subscribe', () => {
      this.pushSubscribed = true;
      return noContent();
    });
    r.delete('/api/v1/push/subscribe', () => {
      this.pushSubscribed = false;
      return noContent();
    });

    // ---- search / audit / uploads ---------------------------------------
    r.get('/api/v1/search', (req) => {
      const q = (req.query.get('q') ?? '').toLowerCase();
      const hit = (s: string) => q.length > 0 && s.toLowerCase().includes(q);
      return json({
        contacts: this.contacts.filter((c) => hit(c.name)).map((c) => ({ id: c.id, type: 'contact', title: c.name, subtitle: c.org ?? null, url: `/contacts/${c.id}` })),
        partners: this.partners.filter((p) => hit(p.name)).map((p) => ({ id: p.id, type: 'partner', title: p.name, subtitle: null, url: `/partners/${p.id}` })),
        events: this.events.filter((e) => hit(e.title)).map((e) => ({ id: e.id, type: 'event', title: e.title, subtitle: e.location, url: `/events/${e.id}` })),
        ideas: this.ideas.filter((i) => hit(i.title)).map((i) => ({ id: i.id, type: 'idea', title: i.title, subtitle: i.status, url: `/ideas/${i.id}` })),
        locations: this.locations.filter((l) => hit(l.name)).map((l) => ({ id: l.id, type: 'location', title: l.name, subtitle: l.city, url: `/locations/${l.id}` })),
      });
    });
    r.get('/api/v1/admin/audit', (req) => {
      const actor = req.query.get('actor');
      const entityType = req.query.get('entityType');
      const action = req.query.get('action');
      let items = this.auditEntries;
      if (actor) items = items.filter((a) => a.actorUserId === actor);
      if (entityType) items = items.filter((a) => a.entityType === entityType);
      if (action) items = items.filter((a) => a.action === action);
      return json(this.paged(items, req.query, 'page', 'pageSize', 20));
    });
    r.post('/api/v1/uploads', () => json({ url: `/uploads/${this.nextId('file')}.png` }, 201));
  }

  private profileFor(user: seed.MockUser): Record<string, unknown> {
    return (
      this.profiles[user.id] ?? {
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: `${user.firstName} ${user.lastName}`,
        pronouns: '',
        title: '',
        city: user.city,
        timezone: 'America/Toronto',
        locale: 'en-CA',
        avatarUrl: null,
        email: user.email,
      }
    );
  }

  private userRow(u: seed.MockUser) {
    return { id: u.id, email: u.email, name: `${u.firstName} ${u.lastName}`, role: u.role, city: u.city, status: u.status, lastSignIn: u.lastSignIn };
  }

  private ideaDto(i: seed.MockIdea) {
    const { comments: _c, ...rest } = i;
    return rest;
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

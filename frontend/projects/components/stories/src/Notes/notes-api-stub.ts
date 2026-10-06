import { HttpClient } from '@angular/common/http';
import type { Provider } from '@angular/core';
import { of } from 'rxjs';

import type { NoteDto } from 'components';

/**
 * An in-memory stand-in for the notes API, so `tar-notes` renders and its
 * create / edit / delete flows work without a backend. Provided on the story
 * wrapper, it shadows the preview's real `HttpClient` for that story only.
 */
export interface NotesStubOptions {
  readonly me: { id: string; roles: string[] };
  readonly notes: NoteDto[];
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const toHtml = (markdown: string) =>
  `<p>${escapeHtml(markdown).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;

export function note(
  id: string,
  createdBy: string,
  bodyMarkdown: string,
  ageHours: number,
  history: NoteDto['history'] = [],
): NoteDto {
  return {
    id,
    subjectType: 'Partner',
    subjectId: 'grace-community-kitchen',
    bodyMarkdown,
    bodyHtmlSanitized: toHtml(bodyMarkdown),
    createdBy,
    createdAt: hoursAgo(ageHours + 1),
    updatedAt: hoursAgo(ageHours),
    history,
  };
}

export function historyEntry(
  id: string,
  createdBy: string,
  bodyMarkdown: string,
  ageHours: number,
) {
  return {
    id,
    createdBy,
    bodyMarkdown,
    bodyHtmlSanitized: toHtml(bodyMarkdown),
    createdAt: hoursAgo(ageHours),
  };
}

export function provideNotesApiStub(options: NotesStubOptions): Provider {
  let notes = [...options.notes];
  let nextId = 100;
  const stub = {
    get: (url: string) => (url.includes('/users/me') ? of(options.me) : of({ items: notes })),
    post: (
      _url: string,
      body: { subjectType: string; subjectId: string; bodyMarkdown: string },
    ) => {
      const created = { ...note(`n${nextId++}`, options.me.id, body.bodyMarkdown, 0) };
      notes = [created, ...notes];
      return of(created);
    },
    put: (url: string, body: { bodyMarkdown: string }) => {
      const id = url.split('/').pop();
      const current = notes.find((n) => n.id === id)!;
      const updated: NoteDto = {
        ...current,
        bodyMarkdown: body.bodyMarkdown,
        bodyHtmlSanitized: toHtml(body.bodyMarkdown),
        updatedAt: new Date().toISOString(),
        history: [
          historyEntry(`h${nextId++}`, current.createdBy, current.bodyMarkdown, 0),
          ...current.history,
        ],
      };
      notes = notes.map((n) => (n.id === id ? updated : n));
      return of(updated);
    },
    delete: (url: string) => {
      const id = url.split('/').pop();
      notes = notes.filter((n) => n.id !== id);
      return of(null);
    },
  };
  return { provide: HttpClient, useValue: stub };
}

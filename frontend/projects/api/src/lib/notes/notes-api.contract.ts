import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { NoteDto } from '../models/note';

export interface INotesApi {
  list(subjectType: string, subjectId: string): Observable<{ items: NoteDto[]; total: number }>;
  create(subjectType: string, subjectId: string, bodyMarkdown: string): Observable<NoteDto>;
  update(id: string, bodyMarkdown: string): Observable<NoteDto>;
  delete(id: string): Observable<void>;
}

export const NOTES_API = new InjectionToken<INotesApi>('NOTES_API');

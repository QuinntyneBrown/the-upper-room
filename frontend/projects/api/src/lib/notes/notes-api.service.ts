import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base-url.token';
import { NoteDto } from '../models/note';
import { INotesApi } from './notes-api.contract';

@Injectable({ providedIn: 'root' })
export class NotesApiService implements INotesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(subjectType: string, subjectId: string): Observable<{ items: NoteDto[]; total: number }> {
    return this.http.get<{ items: NoteDto[]; total: number }>(
      `${this.baseUrl}/api/v1/notes?subjectType=${subjectType}&subjectId=${subjectId}`,
    );
  }

  create(subjectType: string, subjectId: string, bodyMarkdown: string): Observable<NoteDto> {
    return this.http.post<NoteDto>(`${this.baseUrl}/api/v1/notes`, {
      subjectType,
      subjectId,
      bodyMarkdown,
    });
  }

  update(id: string, bodyMarkdown: string): Observable<NoteDto> {
    return this.http.put<NoteDto>(`${this.baseUrl}/api/v1/notes/${id}`, { bodyMarkdown });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/notes/${id}`);
  }
}

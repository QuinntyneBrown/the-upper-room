import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base-url.token';
import { InvitationCreatedResponse, InvitePayload } from '../models/invitation';
import { IInvitationsApi } from './invitations-api.contract';

@Injectable({ providedIn: 'root' })
export class InvitationsApiService implements IInvitationsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  create(payload: InvitePayload): Observable<InvitationCreatedResponse> {
    return this.http.post<InvitationCreatedResponse>(
      `${this.baseUrl}/api/v1/invitations`,
      payload,
    );
  }

  revoke(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/invitations/${id}`);
  }
}

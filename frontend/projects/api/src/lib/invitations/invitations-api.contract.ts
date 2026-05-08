import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { InvitationCreatedResponse, InvitePayload } from '../models/invitation';

export interface IInvitationsApi {
  create(payload: InvitePayload): Observable<InvitationCreatedResponse>;
  revoke(id: string): Observable<void>;
}

export const INVITATIONS_API = new InjectionToken<IInvitationsApi>('INVITATIONS_API');

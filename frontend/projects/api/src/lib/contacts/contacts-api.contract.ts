import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact } from '../models/contact';

export interface IContactsApi {
  get(id: string): Observable<Contact>;
}

export const CONTACTS_API = new InjectionToken<IContactsApi>('CONTACTS_API');

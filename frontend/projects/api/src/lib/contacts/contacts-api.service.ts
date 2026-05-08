import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base-url.token';
import { Contact } from '../models/contact';
import { IContactsApi } from './contacts-api.contract';

@Injectable({ providedIn: 'root' })
export class ContactsApiService implements IContactsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get(id: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.baseUrl}/api/v1/contacts/${id}`);
  }
}

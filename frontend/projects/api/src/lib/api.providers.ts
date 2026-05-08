import { EnvironmentProviders, Provider, makeEnvironmentProviders } from '@angular/core';
import { API_BASE_URL } from './api-base-url.token';
import { AUTH_API } from './auth/auth-api.contract';
import { AuthApiService } from './auth/auth-api.service';
import { CONTACTS_API } from './contacts/contacts-api.contract';
import { ContactsApiService } from './contacts/contacts-api.service';
import { INVITATIONS_API } from './invitations/invitations-api.contract';
import { InvitationsApiService } from './invitations/invitations-api.service';
import { PROFILE_API } from './profile/profile-api.contract';
import { ProfileApiService } from './profile/profile-api.service';
import { USERS_API } from './users/users-api.contract';
import { UsersApiService } from './users/users-api.service';

export interface ProvideApiOptions {
  readonly baseUrl?: string;
}

export function provideApi(options: ProvideApiOptions = {}): EnvironmentProviders {
  const providers: Provider[] = [
    { provide: API_BASE_URL, useValue: options.baseUrl ?? '' },
    { provide: AUTH_API, useExisting: AuthApiService },
    { provide: USERS_API, useExisting: UsersApiService },
    { provide: PROFILE_API, useExisting: ProfileApiService },
    { provide: INVITATIONS_API, useExisting: InvitationsApiService },
    { provide: CONTACTS_API, useExisting: ContactsApiService },
  ];
  return makeEnvironmentProviders(providers);
}

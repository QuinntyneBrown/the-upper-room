import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile } from '../models/profile';

export interface IProfileApi {
  get(): Observable<Profile>;
  update(profile: Profile): Observable<Profile>;
}

export const PROFILE_API = new InjectionToken<IProfileApi>('PROFILE_API');

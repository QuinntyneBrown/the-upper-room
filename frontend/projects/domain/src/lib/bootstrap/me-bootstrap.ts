// traces_to: L2-023, L2-025
import { Injectable, inject } from '@angular/core';
import { USERS_API } from 'api';
import { catchError, of, tap } from 'rxjs';
import { ACCESS_TOKEN_SOURCE } from '../auth/access-token-source.contract';
import { PERMISSIONS_SERVICE } from '../rbac/permissions.contract';
import { IMeBootstrap } from './me-bootstrap.contract';

@Injectable({ providedIn: 'root' })
export class MeBootstrap implements IMeBootstrap {
  private readonly users = inject(USERS_API);
  private readonly perms = inject(PERMISSIONS_SERVICE);
  private readonly tokenSource = inject(ACCESS_TOKEN_SOURCE);

  load(): void {
    if (!this.tokenSource.current()) return;
    this.users
      .getMe()
      .pipe(
        tap((me) => this.perms.setFromMe(me)),
        catchError(() => of(null)),
      )
      .subscribe();
  }
}

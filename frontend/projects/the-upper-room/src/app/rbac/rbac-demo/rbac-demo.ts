// traces_to: L2-025
import { Component } from '@angular/core';
import { HasPermissionDirective } from '../has-permission.directive';
import { HasRoleDirective } from '../has-role.directive';

@Component({
  selector: 'app-rbac-demo',
  imports: [HasPermissionDirective, HasRoleDirective],
  template: `
    <section class="page">
      <h1>RBAC demo</h1>
      <button data-testid="rbac-delete" type="button" *tarHasPermission="'Contact:Delete'">
        Delete
      </button>
      <span data-testid="rbac-admin" *tarHasRole="['SystemAdmin']">Admin badge</span>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: var(--md-sys-space-3);
        padding: var(--md-sys-space-6);
      }
    `,
  ],
})
export class RbacDemo {}

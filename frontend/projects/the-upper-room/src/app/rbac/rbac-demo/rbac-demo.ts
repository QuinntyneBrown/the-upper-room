// traces_to: L2-025
import { Component } from '@angular/core';
import { TarButton } from 'components';
import { HasPermissionDirective, HasRoleDirective } from 'domain';

@Component({
  selector: 'app-rbac-demo',
  imports: [TarButton, HasPermissionDirective, HasRoleDirective],
  templateUrl: './rbac-demo.html',
  styleUrl: './rbac-demo.scss',
})
export class RbacDemo {}

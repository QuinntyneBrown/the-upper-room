// traces_to: L2-025
import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { PERMISSIONS_SERVICE } from './permissions.contract';

const KNOWN_PERMISSIONS = new Set<string>([
  'User:Manage',
  'Role:Manage',
  'Audit:Read',
  'City:Switch',
  'Event:RSVP',
]);
const PERMISSION_SHAPE = /^[A-Za-z]+:[A-Za-z]+$/;

@Directive({ selector: '[tarHasPermission]' })
export class HasPermissionDirective {
  private readonly tpl = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly perms = inject(PERMISSIONS_SERVICE);

  private current = '';

  @Input({ required: true }) set tarHasPermission(value: string) {
    this.current = value;
    this.warnIfUnknown(value);
  }

  constructor() {
    effect(() => {
      const has = this.current && this.perms.hasPermission(this.current);
      this.vcr.clear();
      if (has) this.vcr.createEmbeddedView(this.tpl);
    });
  }

  private warnIfUnknown(value: string): void {
    if (!value) return;
    if (KNOWN_PERMISSIONS.has(value)) return;
    if (PERMISSION_SHAPE.test(value)) return;
    console.warn(`[tarHasPermission] unknown permission shape: ${value}`);
  }
}

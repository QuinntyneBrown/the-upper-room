// traces_to: L2-025
import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { PERMISSIONS_SERVICE } from './permissions.contract';

@Directive({ selector: '[tarHasRole]' })
export class HasRoleDirective {
  private readonly tpl = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly perms = inject(PERMISSIONS_SERVICE);

  private roles: readonly string[] = [];

  @Input({ required: true }) set tarHasRole(value: readonly string[]) {
    this.roles = value;
  }

  constructor() {
    effect(() => {
      const has = this.roles.length > 0 && this.perms.hasAnyRole(this.roles);
      this.vcr.clear();
      if (has) this.vcr.createEmbeddedView(this.tpl);
    });
  }
}

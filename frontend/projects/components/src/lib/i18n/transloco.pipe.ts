// traces_to: L2-100
import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from './translate.service';

@Pipe({ name: 'transloco', pure: false })
export class TranslocoPipe implements PipeTransform {
  private readonly svc = inject(TranslateService);

  transform(key: string): string {
    this.svc.locale();
    return this.svc.translate(key);
  }
}

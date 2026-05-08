import { Directive } from '@angular/core';
import { MatBadge } from '@angular/material/badge';

@Directive({
  selector: '[tarBadge]',
  hostDirectives: [
    {
      directive: MatBadge,
      inputs: [
        'matBadge: tarBadge',
        'matBadgeColor: tarBadgeColor',
        'matBadgeOverlap: tarBadgeOverlap',
        'matBadgeHidden: tarBadgeHidden',
        'matBadgePosition: tarBadgePosition',
        'matBadgeSize: tarBadgeSize',
      ],
    },
  ],
})
export class TarBadge {}

import { Directive } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  selector: '[tarTooltip]',
  hostDirectives: [
    {
      directive: MatTooltip,
      inputs: [
        'matTooltip: tarTooltip',
        'matTooltipPosition: tarTooltipPosition',
        'matTooltipDisabled: tarTooltipDisabled',
        'matTooltipShowDelay: tarTooltipShowDelay',
        'matTooltipHideDelay: tarTooltipHideDelay',
      ],
    },
  ],
})
export class TarTooltip {}

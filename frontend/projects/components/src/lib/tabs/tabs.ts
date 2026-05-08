import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

export interface TarTab {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean;
}

@Component({
  selector: 'tar-tabs',
  imports: [MatTabsModule, NgTemplateOutlet],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
})
export class TarTabs {
  @Input({ required: true }) tabs: readonly TarTab[] = [];
  @Input() selectedIndex = 0;
  @Input() color: 'primary' | 'accent' | 'warn' | undefined = undefined;
  @Input() testId: string | null = null;

  @ContentChild(TemplateRef) contentTemplate!: TemplateRef<{ $implicit: TarTab }>;

  @Output() readonly selectedIndexChange = new EventEmitter<number>();
}

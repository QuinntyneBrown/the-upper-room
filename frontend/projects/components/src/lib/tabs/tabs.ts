import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
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
export class TarTabs implements AfterViewInit {
  @Input({ required: true }) tabs: readonly TarTab[] = [];
  @Input() selectedIndex = 0;
  @Input() color: 'primary' | 'accent' | 'warn' | undefined = undefined;
  @Input() testId: string | null = null;

  @ContentChild(TemplateRef) contentTemplate!: TemplateRef<{ $implicit: TarTab }>;

  @Output() readonly selectedIndexChange = new EventEmitter<number>();

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (!this.testId) return;
    const tabButtons = this.el.nativeElement.querySelectorAll<HTMLElement>('.mat-mdc-tab');
    this.tabs.forEach((tab, i) => {
      if (tabButtons[i]) tabButtons[i].setAttribute('data-testid', `${this.testId}-tab-${tab.id}`);
    });
  }
}

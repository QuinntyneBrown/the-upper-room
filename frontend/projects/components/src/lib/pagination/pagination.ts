import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

export interface TarPageChange {
  readonly pageIndex: number;
  readonly pageSize: number;
  readonly previousPageIndex: number;
}

@Component({
  selector: 'tar-pagination',
  imports: [MatPaginatorModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class TarPagination {
  @Input({ required: true }) length = 0;
  @Input() pageSize = 25;
  @Input() pageIndex = 0;
  @Input() pageSizeOptions: readonly number[] = [10, 25, 50, 100];
  @Input() showFirstLastButtons = true;
  @Input() hidePageSize = false;
  @Input() testId: string | null = null;

  @Output() readonly pageChange = new EventEmitter<TarPageChange>();

  protected onPage(event: PageEvent): void {
    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      previousPageIndex: event.previousPageIndex ?? 0,
    });
  }
}

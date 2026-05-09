// traces_to: L2-043, L2-044
import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PERMISSIONS_SERVICE } from 'domain';
import { TarEmptyState } from 'components';
import { CreateBoardWizard, CreateBoardForm } from '../create-board-wizard/create-board-wizard';

export interface Board {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly columnCount: number;
  readonly cardCount: number;
  readonly lastActivityAt: string;
}

@Component({
  selector: 'app-board-list',
  imports: [TarEmptyState, RouterLink],
  templateUrl: './board-list.html',
  styleUrl: './board-list.scss',
})
export class BoardList {
  private readonly http = inject(HttpClient);
  private readonly perms = inject(PERMISSIONS_SERVICE);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  protected readonly boards = signal<Board[]>([]);
  protected readonly canCreate = computed(() => this.perms.hasPermission('KanbanBoard:Create'));
  protected readonly isEmpty = computed(() => this.boards().length === 0);

  constructor() {
    this.load();
  }

  protected openWizard(): void {
    this.dialog
      .open<CreateBoardWizard, void, CreateBoardForm>(CreateBoardWizard)
      .afterClosed()
      .subscribe((form) => {
        if (form) this.create(form);
      });
  }

  protected formatDate(value: string): string {
    return new Date(value).toLocaleDateString();
  }

  private create(form: CreateBoardForm): void {
    this.http.post<Board>('/api/v1/boards', form).subscribe((board) => {
      this.boards.update((list) => [...list, board]);
      this.router.navigate(['/boards', board.id]);
    });
  }

  private load(): void {
    this.http.get<{ items: Board[] }>('/api/v1/boards').subscribe((r) => this.boards.set(r.items));
  }
}

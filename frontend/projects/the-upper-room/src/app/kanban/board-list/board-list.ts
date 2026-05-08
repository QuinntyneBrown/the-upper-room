// traces_to: L2-043, L2-044
import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PERMISSIONS_SERVICE } from 'domain';
import { TarEmptyState } from '../../../../../components/src/lib/states/tar-empty-state';
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
  imports: [TarEmptyState, CreateBoardWizard],
  templateUrl: './board-list.html',
  styleUrl: './board-list.scss',
})
export class BoardList {
  private readonly http = inject(HttpClient);
  private readonly perms = inject(PERMISSIONS_SERVICE);

  protected readonly boards = signal<Board[]>([]);
  protected readonly showWizard = signal(false);
  protected readonly canCreate = computed(() => this.perms.hasPermission('KanbanBoard:Create'));
  protected readonly isEmpty = computed(() => this.boards().length === 0);

  constructor() {
    this.load();
  }

  protected openWizard(): void {
    this.showWizard.set(true);
  }

  protected closeWizard(): void {
    this.showWizard.set(false);
  }

  protected onCreate(form: CreateBoardForm): void {
    this.http.post<Board>('/api/v1/boards', form).subscribe((board) => {
      this.boards.update((list) => [...list, board]);
      this.showWizard.set(false);
    });
  }

  protected formatDate(value: string): string {
    return new Date(value).toLocaleDateString();
  }

  private load(): void {
    this.http.get<{ items: Board[] }>('/api/v1/boards').subscribe((r) => this.boards.set(r.items));
  }
}

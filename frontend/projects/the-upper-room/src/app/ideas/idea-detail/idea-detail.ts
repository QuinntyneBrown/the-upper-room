// traces_to: L2-050, L2-051
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { SnackbarService } from '../../../../../components/src/lib/snackbar/tar-snackbar.service';
import { MarkdownEditor } from '../markdown-editor/markdown-editor';
import type { IdeaDto } from '../idea-list/idea-list';

export type IdeaDetailDto = IdeaDto;

@Component({
  selector: 'app-idea-detail',
  imports: [MarkdownEditor],
  templateUrl: './idea-detail.html',
  styleUrl: './idea-detail.scss',
})
export class IdeaDetail implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly snackbar = inject(SnackbarService);

  protected readonly idea = signal<IdeaDetailDto | null>(null);
  protected readonly editMode = signal(false);
  protected readonly editBody = signal('');
  private ideaId = '';

  ngOnInit(): void {
    this.ideaId = this.route.snapshot.paramMap.get('id')!;
    this.http.get<IdeaDetailDto>(`/api/v1/ideas/${this.ideaId}`).subscribe((i) => {
      this.idea.set(i);
      this.editBody.set(i.bodyMarkdown);
    });
  }

  protected openEdit(): void {
    this.editMode.set(true);
  }

  protected cancelEdit(): void {
    const i = this.idea();
    if (i) this.editBody.set(i.bodyMarkdown);
    this.editMode.set(false);
  }

  protected saveEdit(): void {
    this.http
      .patch<IdeaDetailDto>(`/api/v1/ideas/${this.ideaId}`, { bodyMarkdown: this.editBody() })
      .subscribe((updated) => {
        this.idea.set(updated);
        this.editMode.set(false);
        this.snackbar.show('Idea updated', 'success');
      });
  }

  protected toggleVote(): void {
    const idea = this.idea();
    if (!idea) return;
    const wasVoted = idea.hasVoted;
    this.idea.update((i) =>
      i ? { ...i, hasVoted: !wasVoted, voteCount: wasVoted ? i.voteCount - 1 : i.voteCount + 1 } : null
    );
    this.http.post<IdeaDetailDto>(`/api/v1/ideas/${this.ideaId}/vote`, {}).subscribe((updated) => {
      this.idea.set(updated);
      if (wasVoted) this.snackbar.show('Vote removed', 'info');
    });
  }
}

// traces_to: L2-048, L2-049
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SnackbarService, optimisticMutation } from 'components';
import { TarEmptyState } from '../../../../../components/src/lib/states/tar-empty-state';

export interface IdeaDto {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly bodyMarkdown: string;
  readonly bodyHtmlSanitized: string;
  readonly coverImageUrl: string | null;
  readonly status: string;
  readonly voteCount: number;
  readonly hasVoted: boolean;
  readonly proposedBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly tags: string[];
}

@Component({
  selector: 'app-idea-list',
  imports: [TarEmptyState],
  templateUrl: './idea-list.html',
  styleUrl: './idea-list.scss',
})
export class IdeaList implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly snackbar = inject(SnackbarService);

  protected readonly ideas = signal<IdeaDto[]>([]);
  protected readonly myIdeasFilter = signal(false);
  protected readonly sort = signal('newest');

  ngOnInit(): void {
    this.load();
  }

  private buildParams(): string {
    const params = new URLSearchParams();
    if (this.myIdeasFilter()) params.set('myIdeas', 'true');
    if (this.sort() !== 'newest') params.set('sort', this.sort());
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  private load(): void {
    this.http
      .get<{ items: IdeaDto[] }>(`/api/v1/ideas${this.buildParams()}`)
      .subscribe((r) => this.ideas.set(r.items));
  }

  protected toggleMyIdeas(): void {
    this.myIdeasFilter.update((v) => !v);
    this.load();
  }

  protected onSortChange(value: string): void {
    this.sort.set(value);
    this.load();
  }

  protected toggleVote(idea: IdeaDto): void {
    const wasVoted = idea.hasVoted;
    const next = this.ideas().map((i) =>
      i.id === idea.id
        ? { ...i, hasVoted: !wasVoted, voteCount: wasVoted ? i.voteCount - 1 : i.voteCount + 1 }
        : i
    );

    optimisticMutation(
      this.ideas,
      next,
      () => this.http.post<IdeaDto>(`/api/v1/ideas/${idea.id}/vote`, {}),
      () => this.snackbar.show("Couldn't save. Try again.", 'error'),
    );
  }
}

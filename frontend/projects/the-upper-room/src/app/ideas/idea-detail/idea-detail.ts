// traces_to: L2-050, L2-051, L2-052
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '../../../../../components/src/lib/snackbar/tar-snackbar.service';
import { optimisticMutation } from 'components';
import { TarMarkdownEditor } from '../../../../../components/src/lib/markdown-editor/tar-markdown-editor';
import type { IdeaDto, LinkedPartnerRef } from '../idea-list/idea-list';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

export type IdeaDetailDto = IdeaDto;

interface MeDto { id: string; roles: string[] }

interface PartnerSearchResult {
  readonly id: string;
  readonly name: string;
}

@Component({
  selector: 'app-idea-detail',
  imports: [TarMarkdownEditor],
  templateUrl: './idea-detail.html',
  styleUrl: './idea-detail.scss',
})
export class IdeaDetail implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);

  protected readonly idea = signal<IdeaDetailDto | null>(null);
  protected readonly me = signal<MeDto | null>(null);
  protected readonly editMode = signal(false);
  protected readonly editBody = signal('');
  private ideaId = '';

  // Partner linking
  protected readonly linkedPartners = signal<LinkedPartnerRef[]>([]);
  protected readonly showPartnerSearch = signal(false);
  protected readonly partnerQuery = signal('');
  protected readonly partnerResults = signal<PartnerSearchResult[]>([]);
  private readonly partnerSearch$ = new Subject<string>();

  protected readonly isLead = computed(() =>
    this.me()?.roles.some((r) => r === 'CityLead' || r === 'SystemAdmin') ?? false
  );
  protected readonly isProposer = computed(() =>
    this.me()?.id === this.idea()?.proposedBy
  );
  protected readonly canSubmit = computed(() =>
    this.isProposer() && this.idea()?.status === 'Draft'
  );

  readonly statusOptions = ['Submitted', 'UnderReview', 'Selected', 'InProgress', 'Completed', 'Archived'];

  ngOnInit(): void {
    this.ideaId = this.route.snapshot.paramMap.get('id')!;
    this.http.get<MeDto>('/api/v1/users/me').subscribe((m) => this.me.set(m));
    this.http.get<IdeaDetailDto>(`/api/v1/ideas/${this.ideaId}`).subscribe((i) => {
      this.idea.set(i);
      this.editBody.set(i.bodyMarkdown);
      this.linkedPartners.set(i.linkedPartners ?? []);
    });

    this.partnerSearch$.pipe(debounceTime(250), distinctUntilChanged()).subscribe((q) => {
      if (!q) { this.partnerResults.set([]); return; }
      this.http.get<{ items: PartnerSearchResult[] }>(`/api/v1/partners?search=${encodeURIComponent(q)}`)
        .subscribe((r) => this.partnerResults.set(r.items));
    });
  }

  protected openEdit(): void { this.editMode.set(true); }

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

  protected submitIdea(): void {
    this.postStatus('Submitted');
  }

  protected onStatusChange(newStatus: string): void {
    const idea = this.idea();
    if (!idea || newStatus === idea.status) return;
    optimisticMutation(
      this.idea,
      { ...idea, status: newStatus },
      () => this.http.post<IdeaDetailDto>(`/api/v1/ideas/${this.ideaId}/status`, { status: newStatus }),
      () => this.snackbar.show("Couldn't save. Try again.", 'error'),
    );
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

  protected onCoverFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    this.http.post<IdeaDetailDto>(`/api/v1/ideas/${this.ideaId}/cover`, form).subscribe((updated) => {
      this.idea.set(updated);
    });
  }

  protected onPartnerSearch(value: string): void {
    this.partnerQuery.set(value);
    this.partnerSearch$.next(value);
  }

  protected selectPartner(partner: PartnerSearchResult): void {
    this.partnerResults.set([]);
    this.partnerQuery.set('');
    this.showPartnerSearch.set(false);
    this.http.post(`/api/v1/ideas/${this.ideaId}/partners`, { partnerId: partner.id }).subscribe(() => {
      this.linkedPartners.update((list) => {
        if (list.some((p) => p.id === partner.id)) return list;
        return [...list, { id: partner.id, name: partner.name }];
      });
    });
  }

  protected unlinkPartner(partnerId: string): void {
    this.http.delete(`/api/v1/ideas/${this.ideaId}/partners/${partnerId}`).subscribe(() => {
      this.linkedPartners.update((list) => list.filter((p) => p.id !== partnerId));
    });
  }

  protected goToPartner(id: string): void {
    void this.router.navigateByUrl(`/partners/${id}`);
  }

  private postStatus(status: string): void {
    this.http
      .post<IdeaDetailDto>(`/api/v1/ideas/${this.ideaId}/status`, { status })
      .subscribe({
        next: (updated) => this.idea.set(updated),
        error: (err: HttpErrorResponse) => {
          const message: string = err.error?.error ?? 'Status update failed.';
          this.snackbar.show(message, 'error');
        },
      });
  }
}

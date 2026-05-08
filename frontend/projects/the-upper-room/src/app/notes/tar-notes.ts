// traces_to: L2-041, L2-042
import { Component, ElementRef, Input, OnInit, ViewChild, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SnackbarService } from '../../../../components/src/lib/snackbar/tar-snackbar.service';

export interface NoteDto {
  id: string;
  subjectType: string;
  subjectId: string;
  bodyMarkdown: string;
  bodyHtmlSanitized: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  history: { id: string; bodyMarkdown: string; bodyHtmlSanitized: string; createdAt: string; createdBy: string }[];
}

@Component({
  selector: 'tar-notes',
  imports: [],
  templateUrl: './tar-notes.html',
  styleUrl: './tar-notes.scss',
})
export class TarNotes implements OnInit {
  @Input({ required: true }) subjectType!: string;
  @Input({ required: true }) subjectId!: string;

  @ViewChild('composerEl') readonly composerEl?: ElementRef<HTMLTextAreaElement>;

  private readonly http = inject(HttpClient);
  private readonly snackbar = inject(SnackbarService);

  protected readonly notes = signal<NoteDto[]>([]);
  protected readonly composerText = signal('');
  protected readonly composerError = signal<string | null>(null);
  protected readonly editingId = signal<string | null>(null);
  protected readonly editingText = signal('');
  protected readonly currentUserId = signal<string | null>(null);
  protected readonly isAdmin = signal(false);
  protected readonly historyNote = signal<NoteDto | null>(null);
  protected readonly historyPreviewHtml = signal<string | null>(null);

  ngOnInit(): void {
    this.http.get<{ id: string; roles: string[] }>('/api/v1/users/me').subscribe((me) => {
      this.currentUserId.set(me.id);
      this.isAdmin.set(me.roles.includes('SystemAdmin'));
    });
    this.http
      .get<{ items: NoteDto[] }>(`/api/v1/notes?subjectType=${this.subjectType}&subjectId=${this.subjectId}`)
      .subscribe((r) => this.notes.set(r.items));
  }

  protected submit(): void {
    const body = this.composerText().trim();
    if (body.length < 2) {
      this.composerError.set('Notes must be at least 2 characters.');
      setTimeout(() => this.composerEl?.nativeElement.focus(), 0);
      return;
    }
    this.composerError.set(null);
    this.http
      .post<NoteDto>('/api/v1/notes', { subjectType: this.subjectType, subjectId: this.subjectId, bodyMarkdown: body })
      .subscribe((note) => {
        this.notes.set([note, ...this.notes()]);
        this.composerText.set('');
      });
  }

  protected onComposerKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      this.submit();
    }
  }

  protected startEdit(note: NoteDto): void {
    this.editingId.set(note.id);
    this.editingText.set(note.bodyMarkdown);
  }

  protected saveEdit(noteId: string): void {
    const body = this.editingText().trim();
    if (body.length < 2) return;
    this.http
      .put<NoteDto>(`/api/v1/notes/${noteId}`, { bodyMarkdown: body })
      .subscribe((updated) => {
        this.notes.set(this.notes().map((n) => (n.id === updated.id ? updated : n)));
        this.editingId.set(null);
      });
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected deleteNote(noteId: string): void {
    this.http.delete(`/api/v1/notes/${noteId}`).subscribe(() => {
      this.notes.set(this.notes().filter((n) => n.id !== noteId));
      this.snackbar.show('Note deleted', 'info');
    });
  }

  protected canModify(note: NoteDto): boolean {
    const uid = this.currentUserId();
    return uid !== null && (note.createdBy === uid || this.isAdmin());
  }

  protected openHistory(note: NoteDto): void {
    this.historyNote.set(note);
    this.historyPreviewHtml.set(note.bodyHtmlSanitized);
  }

  protected closeHistory(): void {
    this.historyNote.set(null);
    this.historyPreviewHtml.set(null);
  }

  protected selectVersion(html: string): void {
    this.historyPreviewHtml.set(html);
  }

  protected relativeTime(dateStr: string): string {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffDays = diffMs / 86_400_000;
    if (diffDays > 7) return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const diffMins = diffMs / 60_000;
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${Math.floor(diffMins)} min ago`;
    const diffHours = diffMs / 3_600_000;
    if (diffHours < 24) return `${Math.floor(diffHours)} h ago`;
    return `${Math.floor(diffDays)} d ago`;
  }
}

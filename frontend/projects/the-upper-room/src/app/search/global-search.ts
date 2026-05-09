// traces_to: L2-060
import { Component, OnInit, OnDestroy, inject, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  url: string;
}

interface SearchResponse {
  contacts: SearchResult[];
  partners: SearchResult[];
  events: SearchResult[];
  ideas: SearchResult[];
  locations: SearchResult[];
}

@Component({
  selector: 'app-global-search',
  imports: [],
  templateUrl: './global-search.html',
  styleUrl: './global-search.scss',
})
export class GlobalSearch implements OnInit, OnDestroy {
  @ViewChild('searchInput') inputRef!: ElementRef<HTMLInputElement>;

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  protected readonly query = signal('');
  protected readonly results = signal<SearchResult[]>([]);
  protected readonly activeIndex = signal(-1);
  protected readonly hasResults = computed(() => this.results().length > 0);
  protected readonly isEmpty = computed(() => this.query().length > 0 && !this.hasResults());

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    requestAnimationFrame(() => this.inputRef?.nativeElement.focus());
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  protected onInput(value: string): void {
    this.query.set(value);
    this.activeIndex.set(-1);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (!value.trim()) { this.results.set([]); return; }
    this.debounceTimer = setTimeout(() => {
      this.http.get<SearchResponse>(`/api/v1/search?q=${encodeURIComponent(value)}`)
        .subscribe(r => {
          const all = [...r.contacts, ...r.partners, ...r.events, ...r.ideas, ...r.locations];
          this.results.set(all);
        });
    }, 300);
  }

  protected onKeydown(e: KeyboardEvent): void {
    const len = this.results().length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex.update(i => Math.min(i + 1, len - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex.update(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      const idx = this.activeIndex();
      if (idx >= 0 && idx < len) this.navigate(this.results()[idx]);
    }
  }

  protected navigate(result: SearchResult): void {
    void this.router.navigateByUrl(result.url);
  }

  protected typeIcon(type: string): string {
    const icons: Record<string, string> = {
      contact: 'person',
      partner: 'handshake',
      event: 'event',
      idea: 'lightbulb',
      location: 'location_on',
    };
    return icons[type] ?? 'search';
  }
}

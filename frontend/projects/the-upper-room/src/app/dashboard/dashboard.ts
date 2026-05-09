// traces_to: L2-059
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

interface DashboardStats {
  contacts: number;
  partners: number;
  upcomingEvents: number;
  openIdeas: number;
}

interface UpcomingEvent {
  id: string;
  title: string;
  startAt: string;
  location: string | null;
}

interface BoardCard {
  id: string;
  title: string;
}

interface BoardGroup {
  boardId: string;
  boardTitle: string;
  cards: BoardCard[];
}

interface DashboardDto {
  firstName: string;
  stats: DashboardStats;
  upcomingEvents: UpcomingEvent[];
  tasksOnMyBoards: BoardGroup[];
}

const STAT_DEFS: { key: keyof DashboardStats; label: string; id: string; icon: string }[] = [
  { key: 'contacts', label: 'Contacts', id: 'contacts', icon: 'contacts' },
  { key: 'partners', label: 'Partners', id: 'partners', icon: 'handshake' },
  { key: 'upcomingEvents', label: 'Upcoming Events', id: 'upcoming-events', icon: 'event' },
  { key: 'openIdeas', label: 'Open Ideas', id: 'open-ideas', icon: 'lightbulb' },
];

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly http = inject(HttpClient);

  protected readonly data = signal<DashboardDto | null>(null);
  protected readonly statDefs = STAT_DEFS;

  ngOnInit(): void {
    this.http.get<DashboardDto>('/api/v1/dashboard')
      .subscribe(d => this.data.set(d));
  }

  protected formatDate(iso: string): string {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit',
      }).format(new Date(iso));
    } catch { return iso; }
  }
}

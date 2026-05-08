// traces_to: L2-029, L2-030
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PermissionsService } from '../../rbac/permissions.service';
import { TarEmptyState } from '../../../../../components/src/lib/states/tar-empty-state';

export interface Contact {
  readonly id: string;
  readonly name: string;
  readonly cityId: string;
}

@Component({
  selector: 'app-contact-list',
  imports: [TarEmptyState],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly perms = inject(PermissionsService);

  protected readonly contacts = signal<Contact[]>([]);
  protected readonly canCreate = computed(() => this.perms.hasPermission('Contact:Create'));
  protected readonly isEmpty = computed(() => this.contacts().length === 0);

  ngOnInit(): void {
    this.http
      .get<{ items: Contact[] }>('/api/v1/contacts')
      .subscribe((r) => this.contacts.set(r.items));
  }
}

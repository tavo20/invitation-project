import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PartyService } from '../../services/party.service';
import { Party, DjUser } from '../../models/music.models';

@Component({
  selector: 'app-dj-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dj-dashboard.component.html',
  styleUrl: './dj-dashboard.component.scss',
})
export class DjDashboardComponent implements OnInit {
  user: DjUser | null = null;
  parties: Party[] = [];
  loading = true;

  // Modal crear fiesta
  showModal = false;
  newPartyName = '';
  creating = false;
  createError = '';

  constructor(private partyService: PartyService, private router: Router) {}

  ngOnInit(): void {
    if (!this.partyService.isLoggedIn()) {
      this.router.navigate(['/dj']);
      return;
    }

    this.partyService.getProfile().subscribe({
      next: (user) => (this.user = user),
      error: () => this.logout(),
    });

    this.loadParties();
  }

  loadParties(): void {
    this.loading = true;
    this.partyService.getMyParties().subscribe({
      next: (parties) => {
        this.parties = parties;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openCreateModal(): void {
    this.newPartyName = '';
    this.createError = '';
    this.showModal = true;
  }

  closeModal(): void {
    if (this.creating) return;
    this.showModal = false;
  }

  createParty(): void {
    const name = this.newPartyName.trim();
    if (!name) {
      this.createError = 'Escribe un nombre para la fiesta';
      return;
    }

    this.creating = true;
    this.createError = '';

    this.partyService.create({ name }).subscribe({
      next: (party) => {
        this.creating = false;
        this.showModal = false;
        this.router.navigate(['/dj', party.code]);
      },
      error: (err) => {
        this.creating = false;
        this.createError = err?.error?.message || 'No se pudo crear la fiesta';
      },
    });
  }

  openPanel(party: Party): void {
    this.router.navigate(['/dj', party.code]);
  }

  getGuestLink(party: Party): string {
    return `${window.location.origin}/fiesta/${party.code}`;
  }

  async copyLink(party: Party): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.getGuestLink(party));
    } catch {
      // fallback
    }
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      active: 'Activa',
      paused: 'Pausada',
      finished: 'Finalizada',
    };
    return map[status] ?? status;
  }

  logout(): void {
    
    this.partyService.logout();
    this.router.navigate(['/dj']);
  }
}

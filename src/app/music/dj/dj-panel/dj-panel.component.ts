import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PartyService } from '../../services/party.service';
import { RequestService } from '../../services/request.service';
import {
  Party,
  SongRequest,
  RequestStatus,
  formatDuration,
} from '../../models/music.models';

type DjFilter = 'all' | 'pending' | 'queued' | 'played' | 'rejected';

@Component({
  selector: 'app-dj-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dj-panel.component.html',
  styleUrl: './dj-panel.component.scss',
})
export class DjPanelComponent implements OnInit, OnDestroy {
  party: Party | null = null;
  requests: SongRequest[] = [];
  loading = true;
  error = '';
  filter: DjFilter = 'all';
  updatingId = '';
  copied = false;

  private pollInterval: any = null;
  private readonly POLL_MS = 4000;

  formatDuration = formatDuration;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private partyService: PartyService,
    private requestService: RequestService,
  ) {}

  ngOnInit(): void {
    if (!this.partyService.isLoggedIn()) {
      this.router.navigate(['/dj']);
      return;
    }

    const code = this.route.snapshot.paramMap.get('code') ?? '';
    this.partyService.getByCode(code).subscribe({
      next: (party) => {
        this.party = party;
        this.loading = false;
        this.loadRequests();
        this.startPolling();
      },
      error: () => {
        this.error = 'No se encontró esta fiesta.';
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  // ==========================
  // Solicitudes
  // ==========================

  loadRequests(): void {
    if (!this.party) return;
    this.requestService.getByParty(this.party._id).subscribe({
      next: (reqs) => (this.requests = reqs),
    });
  }

  get nowPlaying(): SongRequest | null {
    return this.requests.find((r) => r.status === 'playing') ?? null;
  }

  get filteredRequests(): SongRequest[] {
    if (this.filter === 'all') return this.requests.filter((r) => r.status !== 'playing');
    return this.requests.filter((r) => r.status === this.filter);
  }

  get stats() {
    return {
      total: this.requests.length,
      pending: this.requests.filter((r) => r.status === 'pending').length,
      queued: this.requests.filter((r) => r.status === 'queued').length,
      played: this.requests.filter((r) => r.status === 'played').length,
      rejected: this.requests.filter((r) => r.status === 'rejected').length,
    };
  }

  setFilter(f: DjFilter): void {
    this.filter = f;
  }

  // ==========================
  // Acciones del DJ
  // ==========================

  setStatus(req: SongRequest, status: RequestStatus): void {
    if (this.updatingId) return;
    this.updatingId = req._id;

    this.requestService.updateStatus(req._id, status).subscribe({
      next: () => {
        this.updatingId = '';
        this.loadRequests();
      },
      error: () => (this.updatingId = ''),
    });
  }

  // ==========================
  // Party controls
  // ==========================

  togglePartyStatus(): void {
    if (!this.party) return;
    const next = this.party.status === 'active' ? 'paused' : 'active';
    this.partyService.updateStatus(this.party._id, next).subscribe({
      next: (p) => (this.party = p),
    });
  }

  finishParty(): void {
    if (!this.party || !confirm('¿Finalizar esta fiesta? Ya no se podrán hacer solicitudes.')) return;
    this.partyService.updateStatus(this.party._id, 'finished').subscribe({
      next: (p) => (this.party = p),
    });
  }

  get guestLink(): string {
    return `${window.location.origin}/fiesta/${this.party?.code}`;
  }

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.guestLink);
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    } catch {}
  }

  goBack(): void {
    this.router.navigate(['/dj/dashboard']);
  }

  // ==========================
  // Helpers
  // ==========================

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pendiente',
      queued: 'En cola',
      playing: 'Sonando',
      played: 'Ya sonó',
      rejected: 'Descartada',
    };
    return map[status] ?? status;
  }

  private startPolling(): void {
    this.pollInterval = setInterval(() => this.loadRequests(), this.POLL_MS);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PartyService } from '../../services/party.service';
import { RequestService } from '../../services/request.service';
import { SectionService } from '../../services/section.service';
import {
  Party,
  PartySection,
  SongRequest,
  RequestStatus,
  formatDuration,
} from '../../models/music.models';

type DjFilter = 'all' | 'pending' | 'queued' | 'played' | 'rejected';

@Component({
  selector: 'app-dj-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dj-panel.component.html',
  styleUrl: './dj-panel.component.scss',
})
export class DjPanelComponent implements OnInit, OnDestroy {
  party: Party | null = null;
  requests: SongRequest[] = [];
  sections: PartySection[] = [];
  selectedSectionId = '';
  ranking: SongRequest[] = [];
  loading = true;
  error = '';
  filter: DjFilter = 'all';
  updatingId = '';
  copied = false;

  showSectionForm = false;
  editingSectionId = '';
  sectionGenre = '';
  sectionHorario = '';
  sectionTopCount = 3;
  savingSection = false;
  sectionMessage = '';

  private pollInterval: any = null;
  private readonly POLL_MS = 4000;

  formatDuration = formatDuration;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private partyService: PartyService,
    private requestService: RequestService,
    private sectionService: SectionService,
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
        this.loadSections();
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

  get selectedSection(): PartySection | null {
    return this.sections.find((section) => section._id === this.selectedSectionId) ?? null;
  }

  loadSections(): void {
    if (!this.party) return;
    this.sectionService.getByParty(this.party._id).subscribe({
      next: (sections) => {
        this.sections = this.sortSections(sections);
        const stillThere = this.sections.some((section) => section._id === this.selectedSectionId);
        if (!stillThere) {
          const general = this.sections.find((section) => section.is_general);
          this.selectedSectionId = general?._id ?? this.sections[0]?._id ?? '';
        }
        this.loadRequests();
        this.loadNowPlaying();
        this.loadRanking();
      },
    });
  }

  selectSection(sectionId: string): void {
    if (this.selectedSectionId === sectionId) return;
    this.selectedSectionId = sectionId;
    this.sectionMessage = '';
    this.cancelSectionForm();
    this.loadRequests();
    this.loadRanking();
  }

  loadRequests(): void {
    if (!this.party || !this.selectedSectionId) return;
    this.requestService.getByParty(this.party._id, this.selectedSectionId).subscribe({
      next: (reqs) => (this.requests = reqs),
    });
  }

  loadRanking(): void {
    const section = this.selectedSection;
    if (!section || section.is_general) {
      this.ranking = [];
      return;
    }
    this.sectionService.getRanking(section._id).subscribe({
      next: (ranking) => (this.ranking = ranking),
      error: () => (this.ranking = []),
    });
  }

  nowPlayingRequest: SongRequest | null = null;

  get nowPlaying(): SongRequest | null {
    return this.nowPlayingRequest;
  }

  loadNowPlaying(): void {
    if (!this.party) return;
    this.requestService.getByParty(this.party._id).subscribe({
      next: (reqs) => {
        this.nowPlayingRequest = reqs.find((req) => req.status === 'playing') ?? null;
      },
    });
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
  // Secciones
  // ==========================

  sectionLabel(section: PartySection): string {
    return section.is_general ? 'General' : section.genre;
  }

  trackSection(_index: number, section: PartySection): string {
    return section._id;
  }

  sectionStatusLabel(status: string): string {
    const map: Record<string, string> = {
      scheduled: 'Programada',
      open: 'Abierta',
      closed: 'Cerrada',
    };
    return map[status] ?? status;
  }

  openSectionForm(): void {
    this.editingSectionId = '';
    this.sectionGenre = '';
    this.sectionHorario = '';
    this.sectionTopCount = 3;
    this.sectionMessage = '';
    this.showSectionForm = true;
  }

  editSection(section: PartySection): void {
    if (section.is_general || section.status === 'closed') return;
    this.editingSectionId = section._id;
    this.sectionGenre = section.genre;
    this.sectionHorario = section.horario ?? '';
    this.sectionTopCount = section.top_count || 3;
    this.sectionMessage = '';
    this.showSectionForm = true;
  }

  cancelSectionForm(): void {
    this.showSectionForm = false;
    this.editingSectionId = '';
  }

  saveSection(): void {
    if (!this.party || this.savingSection) return;

    const genre = this.sectionGenre.trim();
    const horario = this.sectionHorario.trim();
    const topCount = Number(this.sectionTopCount);
    if (!genre) {
      this.sectionMessage = 'Escribe el género';
      return;
    }
    if (!horario) {
      this.sectionMessage = 'Escribe el horario, por ejemplo 12 a 1am';
      return;
    }
    if (!topCount || topCount < 1) {
      this.sectionMessage = 'El top tiene que ser al menos 1';
      return;
    }

    const payload = {
      genre,
      horario,
      top_count: topCount,
    };

    this.savingSection = true;
    this.sectionMessage = '';

    const request = this.editingSectionId
      ? this.sectionService.update(this.editingSectionId, payload)
      : this.sectionService.create({ party_id: this.party._id, ...payload });

    request.subscribe({
      next: (section) => {
        this.savingSection = false;
        this.selectedSectionId = section._id;
        this.cancelSectionForm();
        this.loadSections();
      },
      error: (err) => {
        this.savingSection = false;
        this.sectionMessage = err?.error?.message || 'No se pudo guardar la sección';
      },
    });
  }

  openSection(section: PartySection): void {
    if (section.is_general || section.status !== 'scheduled') return;
    this.sectionService.updateStatus(section._id, 'open').subscribe({
      next: () => this.loadSections(),
      error: (err) => {
        this.sectionMessage = err?.error?.message || 'No se pudo abrir la sección';
      },
    });
  }

  closeSection(section: PartySection): void {
    if (section.is_general || section.status !== 'open') return;
    const label = this.sectionLabel(section);
    const confirmed = confirm(
      `¿Cerrar ${label}? Las ${section.top_count} con más likes pasan a la cola y el resto se descarta.`,
    );
    if (!confirmed) return;

    this.sectionService.updateStatus(section._id, 'closed').subscribe({
      next: () => this.loadSections(),
      error: (err) => {
        this.sectionMessage = err?.error?.message || 'No se pudo cerrar la sección';
      },
    });
  }

  deleteSection(section: PartySection): void {
    if (section.is_general || section.status !== 'scheduled') return;
    if (!confirm(`¿Eliminar la sección ${this.sectionLabel(section)}?`)) return;

    this.sectionService.delete(section._id).subscribe({
      next: () => {
        if (this.selectedSectionId === section._id) this.selectedSectionId = '';
        this.loadSections();
      },
      error: (err) => {
        this.sectionMessage = err?.error?.message || 'No se pudo eliminar la sección';
      },
    });
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
    this.pollInterval = setInterval(() => this.loadSections(), this.POLL_MS);
  }

  private sortSections(sections: PartySection[]): PartySection[] {
    return [...sections].sort((a, b) => {
      if (a.is_general) return -1;
      if (b.is_general) return 1;
      return 0;
    });
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}

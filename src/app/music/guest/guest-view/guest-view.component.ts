import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SongSearchService } from '../../services/song-search.service';
import { RequestService } from '../../services/request.service';
import { GuestSessionService } from '../../services/guest-session.service';
import { PartyService } from '../../services/party.service';
import { SectionService } from '../../services/section.service';
import {
  Party,
  PartySection,
  SongInfo,
  SongRequest,
  GuestSession,
  formatDuration,
  sectionAcceptsRequests,
} from '../../models/music.models';
import { albumPath, applyAppChrome, guestFromAlbum, rememberAlbum, rememberedAlbum } from '../../../shared/services/event-apps';

type ViewTab = 'pending' | 'played' | 'rejected' | 'mine';

@Component({
  selector: 'app-guest-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './guest-view.component.html',
  styleUrl: './guest-view.component.scss',
})
export class GuestViewComponent implements OnInit, OnDestroy {
  party: Party | null = null;
  partyCode = '';
  loading = true;
  error = '';

  session: GuestSession | null = null;
  entryName = '';
  entryEmail = '';
  entryError = '';

  /** Álbum de fotos del que llegó el invitado: habilita el botón para volver. */
  albumId = '';

  searchQuery = '';
  searchResults: SongInfo[] = [];
  searching = false;
  searchTimeout: any = null;

  requests: SongRequest[] = [];
  sections: PartySection[] = [];
  selectedSectionId = '';
  ranking: SongRequest[] = [];
  suggestError = '';
  activeTab: ViewTab = 'pending';
  submittingTrackId = '';
  togglingLikeId = '';

  private pollInterval: any = null;
  private restoreChrome?: () => void;
  private readonly POLL_MS = 5000;

  formatDuration = formatDuration;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private partyService: PartyService,
    private songSearch: SongSearchService,
    private requestService: RequestService,
    private guestSessionService: GuestSessionService,
    private sectionService: SectionService,
  ) {}

  ngOnInit(): void {
    this.partyCode = this.route.snapshot.paramMap.get('code') ?? '';
    this.restoreChrome = applyAppChrome('#0d0d0d');
    if (!this.partyCode) {
      this.error = 'No se encontró el código de la fiesta.';
      this.loading = false;
      return;
    }

    this.session = this.guestSessionService.getSession();
    if (this.session && this.session.party_code !== this.partyCode) {
      this.session = null;
    }

    const fromAlbum = this.route.snapshot.queryParamMap.get('album');
    if (fromAlbum) rememberAlbum(this.partyCode, fromAlbum);
    this.albumId = fromAlbum || rememberedAlbum(this.partyCode);

    // si ya dio su nombre en el álbum, se le propone el mismo
    if (!this.session) {
      const known = guestFromAlbum();
      this.entryName = known?.name ?? '';
      this.entryEmail = known?.email ?? '';
    }

    this.loadParty();
  }

  ngOnDestroy(): void {
    this.restoreChrome?.();
    this.stopPolling();
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
  }

  async loadParty(): Promise<void> {
    this.loading = true;
    this.partyService.getByCode(this.partyCode).subscribe({
      next: (party) => {
        this.party = party;
        this.loading = false;
        this.loadSections();
        if (this.session) this.startPolling();
      },
      error: (err) => {
        // la fiesta no existe (o el DJ la borró): no se finge una fiesta vacía
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.error = 'Esta fiesta ya no está disponible.';
          this.loading = false;
          return;
        }
        if (environment.production) {
          this.error = 'No pudimos cargar la fiesta. Intenta de nuevo en un momento.';
          this.loading = false;
          return;
        }
        // Modo demo (solo en desarrollo): permite probar sin backend de fiestas
        this.party = {
          _id: 'demo',
          name: this.partyCode,
          code: this.partyCode,
          dj_id: '',
          status: 'active',
          config: { maxRequestsPerUser: 0, cooldownMinutes: 0, allowDuplicates: true },
          createdAt: '',
          updatedAt: '',
        };
        this.loading = false;
      },
    });
  }

  enterParty(): void {
    const name = this.entryName.trim();
    const email = this.entryEmail.trim();

    if (!name) {
      this.entryError = 'Escribe tu nombre';
      return;
    }
    if (!email) {
      this.entryError = 'Escribe tu correo';
      return;
    }

    this.entryError = '';
    this.session = this.guestSessionService.createSession(name, email, this.partyCode);
    this.loadSections();
    this.startPolling();
  }

  get albumLink(): string[] | null {
    return this.albumId ? albumPath(this.albumId) : null;
  }

  get selectedSection(): PartySection | null {
    return this.sections.find((section) => section._id === this.selectedSectionId) ?? null;
  }

  get canSuggest(): boolean {
    return !!this.selectedSection && sectionAcceptsRequests(this.selectedSection);
  }

  get requestBlockedMessage(): string {
    const section = this.selectedSection;
    if (!section) return 'Todavía no hay una sección para pedir canciones.';
    if (section.status === 'closed') return 'Esta sección ya cerró. Estas son las que se van a poner.';
    if (section.status === 'scheduled') return 'El DJ todavía no abre esta sección.';
    return 'Esta sección no está recibiendo canciones.';
  }

  sectionLabel(section: PartySection): string {
    return section.is_general ? 'General' : section.genre;
  }

  trackSection(_index: number, section: PartySection): string {
    return section._id;
  }

  selectSection(sectionId: string): void {
    if (this.selectedSectionId === sectionId) return;
    this.selectedSectionId = sectionId;
    this.suggestError = '';
    this.clearSearch();
    this.loadRequests();
    this.loadRanking();
  }

  loadSections(): void {
    if (!this.party || this.party._id === 'demo') return;
    this.sectionService.getByParty(this.party._id).subscribe({
      next: (sections) => {
        this.sections = this.sortSections(sections);
        const stillThere = this.sections.some((section) => section._id === this.selectedSectionId);
        if (!stillThere) this.selectedSectionId = this.pickDefaultSection(this.sections);
        if (this.session) {
          this.loadRequests();
          this.loadNowPlaying();
          this.loadRanking();
        }
      },
    });
  }

  onSearchInput(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    const query = this.searchQuery.trim();
    if (query.length < 2) {
      this.searchResults = [];
      return;
    }

    this.searching = true;
    this.searchTimeout = setTimeout(() => {
      this.songSearch.search(query).subscribe({
        next: (tracks) => {
          this.searchResults = tracks;
          this.searching = false;
        },
        error: () => {
          this.searchResults = [];
          this.searching = false;
        },
      });
    }, 400);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
  }

  suggestSong(song: SongInfo): void {
    if (!this.party || !this.session || !this.selectedSection || this.submittingTrackId) return;
    if (!this.canSuggest) {
      this.suggestError = this.requestBlockedMessage;
      return;
    }

    this.suggestError = '';
    this.submittingTrackId = song.spotifyId;
    this.requestService
      .create({
        party_id: this.party._id,
        section_id: this.selectedSection._id,
        song,
        guest: {
          session_id: this.session.session_id,
          name: this.session.name,
          email: this.session.email,
        },
      })
      .subscribe({
        next: () => {
          this.submittingTrackId = '';
          this.clearSearch();
          this.loadRequests();
        },
        error: (err) => {
          this.submittingTrackId = '';
          this.suggestError = err?.error?.message || 'No se pudo pedir la canción';
        },
      });
  }

  isAlreadyRequested(song: SongInfo): boolean {
    return this.requests.some((r) => r.song.spotifyId === song.spotifyId);
  }

  loadRequests(): void {
    if (!this.party || !this.selectedSectionId || this.party._id === 'demo') return;
    this.requestService.getByParty(this.party._id, this.selectedSectionId).subscribe({
      next: (reqs) => (this.requests = reqs),
      error: () => {},
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

  /** La carátula de lo que suena, desenfocada, tiñe el fondo (una sola, se reemplaza al cambiar). */
  get ambientTracks(): SongRequest[] {
    return this.nowPlaying?.song.albumImage ? [this.nowPlaying] : [];
  }

  trackAmbient(_index: number, request: SongRequest): string {
    return request._id;
  }

    get nowPlaying(): SongRequest | null {
    return this.nowPlayingRequest;
  }

  loadNowPlaying(): void {
    if (!this.party || this.party._id === 'demo') return;
    this.requestService.getByParty(this.party._id).subscribe({
      next: (reqs) => {
        this.nowPlayingRequest = reqs.find((req) => req.status === 'playing') ?? null;
      },
    });
  }

  get filteredRequests(): SongRequest[] {
    if (this.activeTab === 'mine') {
      return this.requests.filter((r) => r.suggested_by.session_id === this.session?.session_id);
    }
    if (this.activeTab === 'played') {
      return this.requests.filter((r) => r.status === 'played');
    }
    if (this.activeTab === 'rejected') {
      return this.requests.filter((r) => r.status === 'rejected');
    }
    return this.requests.filter((r) => r.status === 'pending');
  }

  get pendingCount(): number {
    return this.requests.filter((r) => r.status === 'pending').length;
  }

  get playedCount(): number {
    return this.requests.filter((r) => r.status === 'played').length;
  }

  get rejectedCount(): number {
    return this.requests.filter((r) => r.status === 'rejected').length;
  }

  get mineCount(): number {
    return this.requests.filter((r) => r.suggested_by.session_id === this.session?.session_id).length;
  }

  setTab(tab: ViewTab): void {
    this.activeTab = tab;
  }

  toggleLike(req: SongRequest): void {
    if (!this.session || this.togglingLikeId) return;
    this.togglingLikeId = req._id;

    this.requestService.toggleLike(req._id, this.session.session_id).subscribe({
      next: (updated) => {
        const idx = this.requests.findIndex((r) => r._id === updated._id);
        if (idx !== -1) this.requests[idx] = updated;
        this.togglingLikeId = '';
      },
      error: () => {
        this.togglingLikeId = '';
      },
    });
  }

  hasLiked(req: SongRequest): boolean {
    return req.liked_by?.includes(this.session?.session_id ?? '') ?? false;
  }

  canLike(req: SongRequest): boolean {
    if (!this.selectedSection || !sectionAcceptsRequests(this.selectedSection)) return false;
    return req.status === 'pending' || req.status === 'queued';
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      queued: '¡En cola!',
      playing: 'Sonando 🔊',
      played: 'Ya sonó ✅',
      rejected: 'Descartada',
    };
    return labels[status] ?? status;
  }

  statusClass(status: string): string {
    return `status--${status}`;
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollInterval = setInterval(() => this.loadSections(), this.POLL_MS);
  }

  private sortSections(sections: PartySection[]): PartySection[] {
    return [...sections].sort((a, b) => {
      if (a.is_general) return -1;
      if (b.is_general) return 1;
      return 0;
    });
  }

  private pickDefaultSection(sections: PartySection[]): string {
    const live = sections.find((section) => !section.is_general && sectionAcceptsRequests(section));
    if (live) return live._id;
    const general = sections.find((section) => section.is_general);
    return general?._id ?? sections[0]?._id ?? '';
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}

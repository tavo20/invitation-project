import { Injectable } from '@angular/core';
import { GuestSession } from '../models/music.models';
import { v4 as uuidv4 } from 'uuid';

const GUEST_KEY = 'party_guest';

@Injectable({ providedIn: 'root' })
export class GuestSessionService {

  getSession(): GuestSession | null {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as GuestSession;
    } catch {
      return null;
    }
  }

  hasSession(partyCode: string): boolean {
    const session = this.getSession();
    return !!session && session.party_code === partyCode;
  }

  createSession(name: string, email: string, partyCode: string): GuestSession {
    const session: GuestSession = {
      session_id: uuidv4(),
      name,
      email,
      party_code: partyCode,
    };
    localStorage.setItem(GUEST_KEY, JSON.stringify(session));
    return session;
  }

  getSessionId(): string {
    return this.getSession()?.session_id ?? '';
  }

  clearSession(): void {
    localStorage.removeItem(GUEST_KEY);
  }
}

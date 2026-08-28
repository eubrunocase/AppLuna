import { Injectable, signal } from '@angular/core';

export interface ReservationSpaceDraft {
  id: number;
  type: string;
  name: string;
  description: string;
  imageSrc: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationDraftService {
  readonly selectedSpace = signal<ReservationSpaceDraft | null>(null);
  readonly selectedDate = signal('');
  readonly showAvailabilityResult = signal<boolean | null>(null);
  /** Prefixo da pilha: home ou reservations */
  readonly stackPrefix = signal<'home' | 'reservations'>('home');

  setStackPrefix(prefix: 'home' | 'reservations'): void {
    this.stackPrefix.set(prefix);
  }

  resolvePrefixFromUrl(url: string): 'home' | 'reservations' {
    return url.includes('/app/reservations/') ? 'reservations' : 'home';
  }

  spaceRoute(): string {
    return this.stackPrefix() === 'reservations'
      ? '/app/reservations/new/space'
      : '/app/home/reservation/new/space';
  }

  dateRoute(spaceId: number): string {
    return this.stackPrefix() === 'reservations'
      ? `/app/reservations/new/date/${spaceId}`
      : `/app/home/reservation/new/date/${spaceId}`;
  }

  completeRoute(): string {
    return this.stackPrefix() === 'reservations'
      ? '/app/reservations'
      : '/app/home';
  }

  reset(): void {
    this.selectedSpace.set(null);
    this.selectedDate.set('');
    this.showAvailabilityResult.set(null);
  }
}

import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

/** Breakpoint alinhado ao layout desktop do login. */
export const DESKTOP_BREAKPOINT = '(min-width: 1024px)';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isDesktop = toSignal(
    this.breakpointObserver.observe(DESKTOP_BREAKPOINT).pipe(map((r) => r.matches)),
    { initialValue: typeof window !== 'undefined' && window.matchMedia(DESKTOP_BREAKPOINT).matches },
  );

  readonly isMobile = toSignal(
    this.breakpointObserver.observe(DESKTOP_BREAKPOINT).pipe(map((r) => !r.matches)),
    { initialValue: typeof window === 'undefined' || !window.matchMedia(DESKTOP_BREAKPOINT).matches },
  );
}

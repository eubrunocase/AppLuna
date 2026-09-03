import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

/** Rotas das tabs principais — pré-carrega só estas no idle. */
const PRELOAD_PATHS = new Set(['home', 'reservations', 'deliveries', 'occurrences']);

@Injectable({ providedIn: 'root' })
export class TabPreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (route.path && PRELOAD_PATHS.has(route.path)) {
      return load();
    }
    return of(null);
  }
}

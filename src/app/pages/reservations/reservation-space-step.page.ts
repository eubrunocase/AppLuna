import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, ViewWillEnter } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideCheck } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { catchError, finalize, of } from 'rxjs';
import { AppNavigationService } from '../../core/navigation/app-navigation.service';
import { AppShellService } from '../../core/shell/app-shell.service';
import { SpaceService } from '../../services/space.service';
import { UiService } from '../../shared/services/ui.service';
import { SpaceInfo } from '../../core/models/reservation.model';
import {
  ReservationDraftService,
  ReservationSpaceDraft,
} from './reservation-draft.service';
import { getSpaceCatalogEntry } from './space-catalog';

@Component({
  selector: 'app-reservation-space-step',
  templateUrl: './reservation-space-step.page.html',
  styleUrl: './reservation-flow.scss',
  standalone: true,
  imports: [
    FormsModule,
    IonContent,
    NgIcon,
    HlmButtonImports,
    HlmRadioGroupImports,
    HlmSpinnerImports,
  ],
  providers: [
    provideIcons({
      lucideCheck,
      lucideArrowRight,
    }),
  ],
})
export class ReservationSpaceStepPage implements ViewWillEnter {
  private spaceService = inject(SpaceService);
  private navigation = inject(AppNavigationService);
  private shell = inject(AppShellService);
  private draft = inject(ReservationDraftService);
  private uiService = inject(UiService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  spaces: ReservationSpaceDraft[] = [];
  spacesLoadError = false;
  selectedSpaceId: number | null = null;
  isLoadingSpaces = true;

  ionViewWillEnter(): void {
    const prefix = this.draft.resolvePrefixFromUrl(this.router.url);
    this.draft.setStackPrefix(prefix);
    this.selectedSpaceId = this.draft.selectedSpace()?.id ?? null;

    this.shell.configure({
      title: 'Nova Reserva',
      subtitle: 'Etapa 1 de 2 — escolha o espaço',
      showBack: true,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
      progressStep: 1,
      progressTotal: 2,
    });
    this.shell.setExpandContent(null);

    this.loadSpaces();
  }

  spaceInputId(spaceId: number): string {
    return `reservation-space-${spaceId}`;
  }

  onSpaceSelected(spaceId: number | null): void {
    this.selectedSpaceId = spaceId;
    this.draft.showAvailabilityResult.set(null);
  }

  retryLoadSpaces(): void {
    this.loadSpaces();
  }

  goToNextStep(): void {
    if (!this.selectedSpaceId) return;
    const space = this.spaces.find((s) => s.id === this.selectedSpaceId);
    if (!space) return;
    this.draft.selectedSpace.set(space);
    void this.navigation.push(this.draft.dateRoute(space.id));
  }

  private loadSpaces(): void {
    this.isLoadingSpaces = true;
    this.spacesLoadError = false;
    this.cdr.markForCheck();

    this.spaceService
      .getAll()
      .pipe(
        catchError(() => {
          this.spacesLoadError = true;
          this.uiService.showError('Não foi possível carregar os espaços. Tente novamente.');
          return of([] as SpaceInfo[]);
        }),
        finalize(() => {
          this.isLoadingSpaces = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe((spaces) => {
        this.spaces = spaces
          .map((space) => this.toSpaceOption(space.id, String(space.type)))
          .filter((space): space is ReservationSpaceDraft => space !== null)
          .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

        if (!this.spacesLoadError && spaces.length > 0 && this.spaces.length === 0) {
          this.uiService.showError('Os espaços retornados não puderam ser exibidos.');
        } else if (!this.spacesLoadError && spaces.length === 0) {
          this.uiService.showError('Nenhum espaço cadastrado no sistema.');
        }
      });
  }

  private toSpaceOption(id: number, type: string): ReservationSpaceDraft | null {
    const normalizedType = type.trim().toUpperCase();
    const catalog = getSpaceCatalogEntry(normalizedType);
    if (!catalog) return null;
    return { id, type: normalizedType, ...catalog };
  }
}

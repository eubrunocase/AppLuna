import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, ViewWillEnter } from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCalendarCheck,
  lucideCircleCheck,
  lucideCircleX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { catchError, finalize, Observable, of } from 'rxjs';
import { AppNavigationService } from '../../core/navigation/app-navigation.service';
import { AppShellService } from '../../core/shell/app-shell.service';
import { ReservationService } from '../../services/reservation.service';
import { UiService } from '../../shared/services/ui.service';
import { LunaDatePickerComponent } from '../../shared/components/luna-date-picker/luna-date-picker.component';
import { ReservationDraftService } from './reservation-draft.service';
import { APP_ROUTES } from '../../core/navigation/app-routes';

@Component({
  selector: 'app-reservation-date-step',
  templateUrl: './reservation-date-step.page.html',
  styleUrl: './reservation-flow.scss',
  standalone: true,
  imports: [
    IonContent,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmSpinnerImports,
    LunaDatePickerComponent,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideCalendarCheck,
      lucideCircleCheck,
      lucideCircleX,
    }),
  ],
})
export class ReservationDateStepPage implements ViewWillEnter {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  private navigation = inject(AppNavigationService);
  private shell = inject(AppShellService);
  private draft = inject(ReservationDraftService);
  private uiService = inject(UiService);
  private cdr = inject(ChangeDetectorRef);

  isSubmitting = false;
  isCheckingAvailability = false;

  get selectedSpace() {
    return this.draft.selectedSpace();
  }

  get selectedDate() {
    return this.draft.selectedDate();
  }

  get showAvailabilityResult() {
    return this.draft.showAvailabilityResult();
  }

  ionViewWillEnter(): void {
    const prefix = this.draft.resolvePrefixFromUrl(this.router.url);
    this.draft.setStackPrefix(prefix);

    const spaceId = Number(this.route.snapshot.paramMap.get('spaceId'));
    const current = this.draft.selectedSpace();

    if (!current || current.id !== spaceId) {
      void this.router.navigateByUrl(this.draft.spaceRoute(), { replaceUrl: true });
      return;
    }

    this.shell.configure({
      title: 'Nova Reserva',
      subtitle: 'Etapa 2 de 2 — escolha a data',
      showBack: true,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
      progressStep: 2,
      progressTotal: 2,
    });
    this.shell.setExpandContent(null);
  }

  get minPickerDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  onDatePickerChange(date: Date): void {
    this.draft.selectedDate.set(this.toIsoDate(date));
    this.draft.showAvailabilityResult.set(null);
    this.cdr.markForCheck();
  }

  goToPreviousStep(): void {
    void this.navigation.pop(this.draft.spaceRoute());
  }

  checkAvailability(): void {
    const date = this.resolveSelectedDate();
    const space = this.draft.selectedSpace();
    if (!space || !date) return;

    this.isCheckingAvailability = true;
    this.draft.showAvailabilityResult.set(null);
    this.cdr.markForCheck();

    this.checkAvailability$(date, space.id)
      .pipe(
        finalize(() => {
          this.isCheckingAvailability = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe((isAvailable) => {
        this.draft.showAvailabilityResult.set(isAvailable);
        if (isAvailable === null) {
          this.uiService.showError('Não foi possível verificar a disponibilidade. Tente novamente.');
        }
      });
  }

  onSubmit(): void {
    const space = this.draft.selectedSpace();
    if (!space || this.isSubmitting || this.isCheckingAvailability) return;

    const date = this.resolveSelectedDate();
    if (!date) return;

    if (this.draft.showAvailabilityResult() === false) return;

    if (this.draft.showAvailabilityResult() === null) {
      this.isCheckingAvailability = true;
      this.cdr.markForCheck();

      this.checkAvailability$(date, space.id)
        .pipe(
          finalize(() => {
            this.isCheckingAvailability = false;
            this.cdr.markForCheck();
          }),
        )
        .subscribe((isAvailable) => {
          this.draft.showAvailabilityResult.set(isAvailable);
          if (isAvailable === null) {
            this.uiService.showError('Não foi possível verificar a disponibilidade. Tente novamente.');
            return;
          }
          if (!isAvailable) return;
          this.createReservation(space.id, date);
        });
      return;
    }

    this.createReservation(space.id, date);
  }

  private createReservation(spaceId: number, date: string): void {
    this.isSubmitting = true;
    this.cdr.markForCheck();

    this.reservationService
      .create({ space: spaceId, date })
      .pipe(
        catchError((error) => {
          this.uiService.showError(error.error?.message || 'Erro ao criar reserva');
          return of(null);
        }),
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe(async (result) => {
        if (result) {
          this.draft.reset();
          const dest =
            this.draft.stackPrefix() === 'reservations'
              ? APP_ROUTES.reservations
              : APP_ROUTES.home;
          await this.navigation.completeFlow(dest);
          await this.uiService.showSuccess('Reserva solicitada com sucesso!');
        }
      });
  }

  private resolveSelectedDate(): string {
    if (this.draft.selectedDate()) return this.draft.selectedDate();
    const fallback = this.toIsoDate(this.minPickerDate);
    this.draft.selectedDate.set(fallback);
    return fallback;
  }

  private checkAvailability$(date: string, spaceId: number): Observable<boolean | null> {
    return this.reservationService.checkAvailability(date, spaceId).pipe(catchError(() => of(null)));
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

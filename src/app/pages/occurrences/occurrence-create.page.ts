import { Component, computed, inject, signal } from '@angular/core';
import { IonContent, ViewWillEnter } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowRight,
  lucideCheck,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { catchError, finalize, of } from 'rxjs';
import { OccurrenceService } from '../../services/occurrence.service';
import { AppNavigationService } from '../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../core/navigation/app-routes';
import { AppShellService } from '../../core/shell/app-shell.service';
import { UiService } from '../../shared/services/ui.service';
import { toLocalDateTimeString } from '../../shared/utils/date.utils';
import { LunaDatePickerComponent } from '../../shared/components/luna-date-picker/luna-date-picker.component';
import { LunaTimePickerComponent } from '../../shared/components/luna-time-picker/luna-time-picker.component';

type OccurrenceStep = 1 | 2 | 3;

@Component({
  selector: 'app-occurrence-create',
  templateUrl: './occurrence-create.page.html',
  styleUrl: './occurrence-create.page.scss',
  standalone: true,
  imports: [
    IonContent,
    FormsModule,
    NgIcon,
    HlmButtonImports,
    HlmFieldImports,
    HlmSpinnerImports,
    HlmTextareaImports,
    LunaDatePickerComponent,
    LunaTimePickerComponent,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideArrowRight,
      lucideCheck,
      lucideTriangleAlert,
    }),
  ],
})
export class OccurrenceCreatePage implements ViewWillEnter {
  private occurrenceService = inject(OccurrenceService);
  private navigation = inject(AppNavigationService);
  private uiService = inject(UiService);
  private shell = inject(AppShellService);
  private router = inject(Router);

  readonly step = signal<OccurrenceStep>(1);
  readonly description = signal('');
  readonly selectedDate = signal('');
  readonly selectedTime = signal('');
  readonly isSubmitting = signal(false);

  readonly minPickerDate = (() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setFullYear(date.getFullYear() - 2);
    return date;
  })();

  readonly maxPickerDate = (() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  })();

  readonly canProceedStep1 = computed(() => this.description().trim().length >= 10);

  readonly canProceedStep2 = computed(() => !!this.selectedDate() && !!this.selectedTime());

  readonly canSubmit = computed(() => this.canProceedStep1() && this.canProceedStep2());

  ionViewWillEnter(): void {
    this.updateShell();
    this.shell.setExpandContent(null);
  }

  goToStep(next: OccurrenceStep): void {
    if (next === 2 && !this.canProceedStep1()) {
      return;
    }
    if (next === 3 && !this.canProceedStep2()) {
      return;
    }
    this.step.set(next);
    this.updateShell();
  }

  onDateChange(date: Date): void {
    this.selectedDate.set(this.toIsoDate(date));
  }

  onTimeChange(time: string): void {
    this.selectedTime.set(time);
  }

  onSubmit(): void {
    if (!this.canSubmit() || this.isSubmitting()) {
      return;
    }

    const incidentDate = this.buildIncidentDate();

    this.isSubmitting.set(true);
    this.occurrenceService.create({
      description: this.description().trim(),
      incidentDate,
    }).pipe(
      catchError(error => {
        const message = error?.error?.validationErrors?.description
          || error?.error?.validationErrors?.incidentDate
          || error?.message
          || error?.error?.message
          || 'Erro ao registrar ocorrência';
        void this.uiService.showError(message);
        return of(null);
      }),
      finalize(() => this.isSubmitting.set(false)),
    ).subscribe(async result => {
      if (result) {
        await this.navigation.completeFlow(this.completeRoute());
        await this.uiService.showSuccess('Ocorrência registrada com sucesso!');
      }
    });
  }

  private buildIncidentDate(): string {
    const [hour, minute] = this.selectedTime().split(':').map(Number);
    const [year, month, day] = this.selectedDate().split('-').map(Number);
    const date = new Date(year, month - 1, day, hour, minute, 0);

    if (date.getTime() > Date.now()) {
      return toLocalDateTimeString(new Date());
    }

    return toLocalDateTimeString(date);
  }

  private updateShell(): void {
    const step = this.step();
    const subtitles: Record<OccurrenceStep, string> = {
      1: 'Etapa 1 de 3 — descreva o ocorrido',
      2: 'Etapa 2 de 3 — quando aconteceu',
      3: 'Etapa 3 de 3 — aviso importante',
    };

    this.shell.configure({
      title: 'Nova Ocorrência',
      subtitle: subtitles[step],
      showBack: true,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
      progressStep: step,
      progressTotal: 3,
    });
  }

  private completeRoute(): string {
    return this.router.url.includes('/app/home/')
      ? APP_ROUTES.home
      : APP_ROUTES.occurrences;
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

import { ChangeDetectorRef, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular/standalone';
import { EMPTY, Subscription, catchError, finalize, interval, of, startWith, switchMap, takeWhile } from 'rxjs';
import {
  MonthlyReservationReportDTO,
  ReportExportStatus,
  ReportFormat,
} from '../../core/models';
import { AppShellService } from '../../core/shell/app-shell.service';
import { LayoutService } from '../../core/layout/layout.service';
import { ReservationService } from '../../services/reservation.service';
import { getSpaceCatalogEntry } from '../reservations/space-catalog';
import { CelebrationService } from '../../shared/services/celebration.service';
import { UiService } from '../../shared/services/ui.service';
import { ReportsDesktopComponent } from './desktop/reports-desktop.component';
import { ReportsMobileComponent, type ReportStep } from './mobile/reports-mobile.component';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  standalone: true,
  imports: [ReportsDesktopComponent, ReportsMobileComponent],
})
export class ReportsPage implements OnDestroy, ViewWillEnter {
  private reservationService = inject(ReservationService);
  private shell = inject(AppShellService);
  private uiService = inject(UiService);
  private celebration = inject(CelebrationService);
  private cdr = inject(ChangeDetectorRef);
  readonly layout = inject(LayoutService);

  readonly step = signal<ReportStep>(1);
  readonly selectedMonth = signal(new Date().getMonth() + 1);
  readonly selectedYear = signal(new Date().getFullYear());
  readonly selectedFormat = signal(ReportFormat.PDF);
  readonly report = signal<MonthlyReservationReportDTO[]>([]);
  readonly isLoading = signal(false);
  readonly isExporting = signal(false);

  readonly skeletonItems = [1, 2, 3];
  readonly itemSize = 112;
  readonly trackByReport = (_: number, item: MonthlyReservationReportDTO) =>
    item.date + item.apartment + item.spaceType + item.residentName;
  readonly months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  readonly formatOptions = [
    {
      value: ReportFormat.PDF,
      label: 'PDF',
      hint: 'Pronto para imprimir ou enviar',
      icon: 'lucideFileText',
      inputId: 'report-format-pdf',
    },
    {
      value: ReportFormat.DOCX,
      label: 'DOCX',
      hint: 'Editável no Word',
      icon: 'lucideFileType',
      inputId: 'report-format-docx',
    },
  ];

  readonly minPickerDate = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 5, 0, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  })();

  readonly maxPickerDate = (() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  })();

  readonly pickerDate = computed(() => new Date(this.selectedYear(), this.selectedMonth() - 1, 1));
  readonly canContinuePreview = computed(() => !this.isLoading() && this.report().length > 0);
  readonly periodLabel = computed(() => {
    const month = this.months.find((item) => item.value === this.selectedMonth())?.label ?? '';
    return `${month} de ${this.selectedYear()}`;
  });

  private exportSub: Subscription | undefined;
  private readonly exportPollIntervalMs = 1500;
  private readonly exportTimeoutMs = 5 * 60 * 1000;

  ionViewWillEnter(): void {
    this.updateShell();
    this.shell.setExpandContent(null);
  }

  ngOnDestroy(): void {
    this.exportSub?.unsubscribe();
  }

  onPeriodChange(date: Date): void {
    this.selectedMonth.set(date.getMonth() + 1);
    this.selectedYear.set(date.getFullYear());
  }

  goToStep(next: ReportStep): void {
    if (next === 2) {
      this.loadReport();
    }
    this.step.set(next);
    this.updateShell();
  }

  exportReport(): void {
    if (this.isExporting() || this.isLoading() || this.report().length === 0) {
      return;
    }

    this.exportSub?.unsubscribe();
    this.isExporting.set(true);
    this.cdr.markForCheck();
    const format = this.selectedFormat();

    this.exportSub = this.reservationService
      .createMonthlyReportExport(this.selectedMonth(), this.selectedYear(), format)
      .pipe(
        switchMap((job) => this.pollUntilReady(job)),
        finalize(() => {
          this.isExporting.set(false);
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (blob) => this.downloadReport(blob, format),
        error: (err: unknown) => {
          void this.uiService.showError(this.extractErrorMessage(err));
        },
      });
  }

  getSpaceTypeLabel(type: string): string {
    return getSpaceCatalogEntry(type)?.name || type;
  }

  getSpaceIcon(type: string): string {
    const normalized = (type || '').toUpperCase();
    if (normalized === 'SALAO_FESTAS') return 'lucidePartyPopper';
    if (normalized === 'CHURRASQUEIRA') return 'lucideFlame';
    return 'lucideCalendar';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    }
    return date.toLocaleDateString('pt-BR');
  }

  private loadReport(): void {
    this.isLoading.set(true);
    this.cdr.markForCheck();

    this.reservationService
      .getMonthlyReport(this.selectedMonth(), this.selectedYear())
      .pipe(
        catchError(() => {
          void this.uiService.showError('Erro ao carregar o relatório');
          return of([] as MonthlyReservationReportDTO[]);
        }),
        finalize(() => {
          this.isLoading.set(false);
          this.cdr.markForCheck();
        }),
      )
      .subscribe((report) => {
        this.report.set(report);
      });
  }

  private updateShell(): void {
    const subtitles: Record<ReportStep, string> = {
      1: 'Etapa 1 de 3 — escolha o período',
      2: 'Etapa 2 de 3 — confira as reservas',
      3: 'Etapa 3 de 3 — exporte o arquivo',
    };

    this.shell.configure({
      title: 'Relatórios',
      subtitle: subtitles[this.step()],
      showBack: true,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
      progressStep: this.step(),
      progressTotal: 3,
    });
  }

  private pollUntilReady(job: { jobId: string; status: ReportExportStatus }) {
    const startedAt = Date.now();
    return interval(this.exportPollIntervalMs).pipe(
      startWith(0),
      switchMap(() => this.reservationService.getMonthlyReportExportStatus(job.jobId)),
      takeWhile(
        (current) => current.status === ReportExportStatus.PROCESSING
          && Date.now() - startedAt < this.exportTimeoutMs,
        true,
      ),
      switchMap((current) => {
        if (Date.now() - startedAt >= this.exportTimeoutMs) {
          throw new Error('Tempo de geração do relatório excedido.');
        }
        if (current.status === ReportExportStatus.ERROR) {
          throw new Error(current.errorMessage || 'Falha ao gerar o relatório.');
        }
        if (current.status === ReportExportStatus.READY) {
          return this.reservationService.downloadMonthlyReportExport(current.jobId);
        }
        return EMPTY;
      }),
    );
  }

  private downloadReport(blob: Blob, format: ReportFormat): void {
    const fileName = `relatorio-reservas-${this.padMonth(this.selectedMonth())}-${this.selectedYear()}.${format.toLowerCase()}`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    this.celebration.celebrateSuccess();
    void this.uiService.showSuccess('Relatório exportado');
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === 'object' && err !== null && 'message' in err) {
      const message = (err as { message: unknown }).message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }
    return 'Não foi possível exportar o relatório.';
  }

  private padMonth(month: number): string {
    return month.toString().padStart(2, '0');
  }
}

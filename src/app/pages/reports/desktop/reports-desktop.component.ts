import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowRight,
  lucideDownload,
  lucideFileText,
  lucideFileType,
  lucideInfo,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { MonthlyReservationReportDTO, ReportFormat } from '../../../core/models';
import { LunaDatePickerComponent } from '../../../shared/components/luna-date-picker/luna-date-picker.component';
import { getSpaceCatalogEntry } from '../../reservations/space-catalog';
import type { ReportStep } from '../mobile/reports-mobile.component';

@Component({
  selector: 'app-reports-desktop',
  templateUrl: './reports-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    NgIcon,
    HlmButtonImports,
    HlmRadioGroupImports,
    HlmSpinnerImports,
    HlmTableImports,
    LunaDatePickerComponent,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideArrowRight,
      lucideDownload,
      lucideFileText,
      lucideFileType,
      lucideInfo,
    }),
  ],
})
export class ReportsDesktopComponent {
  readonly step = input<ReportStep>(1);
  readonly report = input<MonthlyReservationReportDTO[]>([]);
  readonly isLoading = input(false);
  readonly isExporting = input(false);
  readonly selectedFormat = input(ReportFormat.PDF);
  readonly periodLabel = input('');
  readonly canContinuePreview = input(false);
  readonly pickerDate = input(new Date());
  readonly minPickerDate = input(new Date());
  readonly maxPickerDate = input(new Date());
  readonly formatOptions = input<{
    value: ReportFormat;
    label: string;
    hint: string;
    icon: string;
    inputId: string;
  }[]>([]);

  readonly periodChange = output<Date>();
  readonly goToStep = output<ReportStep>();
  readonly formatChange = output<ReportFormat>();
  readonly export = output<void>();

  getSpaceTypeLabel(type: string): string {
    return getSpaceCatalogEntry(type)?.name || type;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    }
    return date.toLocaleDateString('pt-BR');
  }
}

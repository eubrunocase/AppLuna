import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { IonContent } from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowRight,
  lucideBuilding2,
  lucideCalendar,
  lucideDownload,
  lucideFileText,
  lucideFileType,
  lucideFlame,
  lucideInfo,
  lucidePartyPopper,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { MonthlyReservationReportDTO, ReportFormat } from '../../../core/models';
import { LunaDatePickerComponent } from '../../../shared/components/luna-date-picker/luna-date-picker.component';
import { getSpaceCatalogEntry } from '../../reservations/space-catalog';

export type ReportStep = 1 | 2 | 3;

@Component({
  selector: 'app-reports-mobile',
  templateUrl: './reports-mobile.component.html',
  styleUrl: './reports-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonContent,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    FormsModule,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmRadioGroupImports,
    HlmSkeletonImports,
    HlmSpinnerImports,
    LunaDatePickerComponent,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideArrowRight,
      lucideBuilding2,
      lucideCalendar,
      lucideDownload,
      lucideFileText,
      lucideFileType,
      lucideFlame,
      lucideInfo,
      lucidePartyPopper,
    }),
  ],
})
export class ReportsMobileComponent {
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
  readonly skeletonItems = input<number[]>([1, 2, 3]);
  readonly itemSize = input(112);
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

  readonly trackByReport = (_: number, item: MonthlyReservationReportDTO) =>
    item.date + item.apartment + item.spaceType + item.residentName;

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
}

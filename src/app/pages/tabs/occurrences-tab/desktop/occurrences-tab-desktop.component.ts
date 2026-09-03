import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideRefreshCw } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { OccurrenceResponseDTO } from '../../../../core/models';

@Component({
  selector: 'app-occurrences-tab-desktop',
  templateUrl: './occurrences-tab-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIcon, HlmButtonImports, HlmSpinnerImports, HlmTableImports],
  providers: [provideIcons({ lucidePlus, lucideRefreshCw })],
})
export class OccurrencesTabDesktopComponent {
  readonly isLoading = input(true);
  readonly occurrences = input<OccurrenceResponseDTO[]>([]);

  readonly create = output<void>();
  readonly refreshList = output<void>();

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR') + ' às ' +
      date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideClock,
  lucideInfo,
  lucidePlus,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { OccurrenceResponseDTO } from '../../../../core/models';

@Component({
  selector: 'app-occurrences-tab-mobile',
  templateUrl: './occurrences-tab-mobile.component.html',
  styleUrl: './occurrences-tab-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    NgIcon,
    HlmCardImports,
    HlmSkeletonImports,
  ],
  providers: [
    provideIcons({
      lucideClock,
      lucideInfo,
      lucidePlus,
      lucideTriangleAlert,
    }),
  ],
})
export class OccurrencesTabMobileComponent {
  readonly isLoading = input(true);
  readonly skeletonItems = input<number[]>([1, 2, 3]);
  readonly occurrences = input<OccurrenceResponseDTO[]>([]);
  readonly itemSize = input(112);

  readonly refresh = output<{ target: { complete: () => void } }>();
  readonly create = output<void>();

  readonly trackById = (_: number, item: OccurrenceResponseDTO) => item.id;

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR') + ' às ' +
      date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}

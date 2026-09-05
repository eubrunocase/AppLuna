import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideClock,
  lucideInfo,
  lucidePlus,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { OccurrenceService } from '../../../services/occurrence.service';
import { OccurrenceResponseDTO } from '../../../core/models';
import { AppNavigationService } from '../../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../../core/navigation/app-routes';
import { AppShellService } from '../../../core/shell/app-shell.service';
import { LayoutService } from '../../../core/layout/layout.service';
import { UiService } from '../../../shared/services/ui.service';
import { LunaItemListComponent } from '../../../shared/components/luna-item-list/luna-item-list.component';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-occurrences-tab',
  templateUrl: './occurrences-tab.page.html',
  standalone: true,
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    NgIcon,
    HlmCardImports,
    HlmSkeletonImports,
    LunaItemListComponent,
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
export class OccurrencesTabPage implements ViewWillEnter {
  private occurrenceService = inject(OccurrenceService);
  private navigation = inject(AppNavigationService);
  private shell = inject(AppShellService);
  private uiService = inject(UiService);
  private cdr = inject(ChangeDetectorRef);
  readonly layout = inject(LayoutService);

  occurrences: OccurrenceResponseDTO[] = [];
  isLoading = true;

  readonly skeletonItems = [1, 2, 3];

  ionViewWillEnter(): void {
    this.loadOccurrences();
    this.shell.configure({
      title: 'Ocorrências',
      showBack: false,
      showLogo: true,
      showLogout: true,
      headerState: 'compact',
      progressStep: null,
      progressTotal: null,
    });
    this.shell.setExpandContent(null);
  }

  loadOccurrences(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.occurrenceService.getAll().pipe(
      catchError(() => {
        void this.uiService.showError('Erro ao carregar ocorrências');
        return of([] as OccurrenceResponseDTO[]);
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }),
    ).subscribe(list => {
      this.occurrences = [...list].sort((a, b) => {
        return new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime();
      });
    });
  }

  refresh(event: { target: { complete: () => void } }): void {
    this.loadOccurrences();
    setTimeout(() => event.target.complete(), 1000);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR') + ' às ' +
      date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  openNewOccurrence(): void {
    void this.navigation.push(APP_ROUTES.occurrencesNew);
  }
}

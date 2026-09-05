import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideCheck } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import type { ReservationSpaceDraft } from '../reservation-draft.service';

@Component({
  selector: 'app-reservation-space-step-mobile',
  templateUrl: './reservation-space-step-mobile.component.html',
  styleUrl: '../reservation-flow.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class ReservationSpaceStepMobileComponent {
  readonly spaces = input<ReservationSpaceDraft[]>([]);
  readonly spacesLoadError = input(false);
  readonly selectedSpaceId = input<number | null>(null);
  readonly isLoadingSpaces = input(true);

  readonly spaceSelected = output<number | null>();
  readonly retry = output<void>();
  readonly next = output<void>();

  spaceInputId(spaceId: number): string {
    return `reservation-space-${spaceId}`;
  }
}

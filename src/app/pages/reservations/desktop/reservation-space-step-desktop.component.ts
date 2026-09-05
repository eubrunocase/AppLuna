import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideCheck, lucideInfo } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import type { ReservationSpaceDraft } from '../reservation-draft.service';

@Component({
  selector: 'app-reservation-space-step-desktop',
  templateUrl: './reservation-space-step-desktop.component.html',
  styleUrl: './reservation-space-step-desktop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    NgIcon,
    HlmButtonImports,
    HlmRadioGroupImports,
    HlmSpinnerImports,
  ],
  providers: [
    provideIcons({
      lucideCheck,
      lucideArrowRight,
      lucideInfo,
    }),
  ],
})
export class ReservationSpaceStepDesktopComponent {
  readonly spaces = input<ReservationSpaceDraft[]>([]);
  readonly spacesLoadError = input(false);
  readonly selectedSpaceId = input<number | null>(null);
  readonly isLoadingSpaces = input(true);

  readonly spaceSelected = output<number | null>();
  readonly retry = output<void>();
  readonly next = output<void>();

  spaceInputId(spaceId: number): string {
    return `reservation-space-desktop-${spaceId}`;
  }

  selectedSpace(): ReservationSpaceDraft | undefined {
    const id = this.selectedSpaceId();
    return this.spaces().find((s) => s.id === id);
  }
}

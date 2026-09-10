import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReservationStatus, SpaceType } from '../../../core/models/enums';

interface TimelineStep {
  label: string;
  status: 'completed' | 'current' | 'pending';
}

const SPACE_STEPS: TimelineStep[] = [
  { label: 'Solicitado', status: 'pending' },
  { label: 'Aprovação', status: 'pending' },
  { label: 'Vistoria Pré', status: 'pending' },
  { label: 'Assinatura', status: 'pending' },
  { label: 'Confirmado', status: 'pending' },
  { label: 'Vistoria Pós', status: 'pending' }
];

const FIELD_STEPS: TimelineStep[] = [
  { label: 'Solicitado', status: 'pending' },
  { label: 'Aprovação', status: 'pending' },
  { label: 'Confirmado', status: 'pending' }
];

const STATUS_STEP_MAP: Record<ReservationStatus, number> = {
  [ReservationStatus.PENDING]: 0,
  [ReservationStatus.APPROVED]: 1,
  [ReservationStatus.AWAITING_INSPECTION]: 2,
  [ReservationStatus.AWAITING_SIGNATURE]: 3,
  [ReservationStatus.CONFIRMED]: 4,
  [ReservationStatus.REJECTED]: -1,
  [ReservationStatus.CANCELLED]: -1
};

@Component({
  selector: 'app-reservation-timeline',
  template: `
    <div class="timeline">
      <div *ngFor="let step of steps; let i = index; let last = last"
           class="timeline-step"
           [class.completed]="step.status === 'completed'"
           [class.current]="step.status === 'current'"
           [class.pending]="step.status === 'pending'"
           [class.rejected]="isRejected && i === 0">
        <div class="step-connector" *ngIf="!last">
          <div class="connector-line" [class.completed]="step.status === 'completed'"></div>
        </div>
        <div class="step-icon">
          <ion-icon *ngIf="step.status === 'completed'" name="checkmark-circle"></ion-icon>
          <ion-icon *ngIf="step.status === 'current'" name="arrow-forward-circle"></ion-icon>
          <ion-icon *ngIf="step.status === 'pending'" name="ellipse-outline"></ion-icon>
        </div>
        <span class="step-label">{{ step.label }}</span>
      </div>
    </div>
  `,
  styles: [`
    .timeline {
      display: flex;
      flex-direction: column;
      padding: 8px 0;
    }

    .timeline-step {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
      min-height: 40px;
    }

    .step-connector {
      position: absolute;
      left: 14px;
      top: 28px;
      width: 2px;
      height: calc(100% - 8px);
    }

    .connector-line {
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 1px;
    }

    .connector-line.completed {
      background: var(--ion-color-success);
    }

    .step-icon {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      z-index: 1;
    }

    .step-icon ion-icon {
      font-size: 24px;
    }

    .completed .step-icon ion-icon {
      color: var(--ion-color-success);
    }

    .current .step-icon ion-icon {
      color: var(--ion-color-primary);
    }

    .pending .step-icon ion-icon {
      color: rgba(255, 255, 255, 0.35);
    }

    .rejected .step-icon ion-icon {
      color: var(--ion-color-danger);
    }

    .step-label {
      font-size: 14px;
      font-weight: 500;
    }

    .completed .step-label {
      color: rgba(255, 248, 240, 0.86);
    }

    .current .step-label {
      color: #fff8f0;
      font-weight: 600;
    }

    .pending .step-label {
      color: rgba(255, 248, 240, 0.45);
    }

    .rejected .step-label {
      color: var(--ion-color-danger);
      text-decoration: line-through;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ReservationTimelineComponent {
  @Input() status: ReservationStatus = ReservationStatus.PENDING;
  @Input() spaceType: SpaceType = SpaceType.SALAO_FESTAS;

  get isRejected(): boolean {
    return this.status === ReservationStatus.REJECTED || this.status === ReservationStatus.CANCELLED;
  }

  get steps(): TimelineStep[] {
    const isField = this.spaceType === SpaceType.CAMPO_FUTEBOL;
    const baseSteps = isField ? [...FIELD_STEPS] : [...SPACE_STEPS];
    const currentIdx = STATUS_STEP_MAP[this.status];

    if (currentIdx === -1) {
      baseSteps[0].status = 'completed';
      return baseSteps;
    }

    return baseSteps.map((step, i) => ({
      ...step,
      status: i < currentIdx ? 'completed' : i === currentIdx ? 'current' : 'pending'
    }));
  }
}

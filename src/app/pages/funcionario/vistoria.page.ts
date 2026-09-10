import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService, InspectionItemDTO } from '../../services/reservation.service';
import { SpaceService } from '../../services/space.service';
import { UiService } from '../../shared/services/ui.service';
import { ReservationResponseDTO } from '../../core/models';
import { InspectionItemFormComponent } from '../../shared/components/inspection-item-form/inspection-item-form.component';
import { SPACE_EQUIPMENT_CATALOG, SPACE_LABELS } from '../../shared/constants/space.constants';
import { formatDate } from '../../shared/utils/date.utils';
import { SpaceType } from '../../core/models/enums';
import { catchError, finalize, of } from 'rxjs';

interface EquipmentItem { name: string; okConfirmed: boolean; photoUrl: string; }

@Component({
  selector: 'app-vistoria',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/funcionario/reservas"></ion-back-button>
        </ion-buttons>
        <ion-title>Vistoria {{ inspectionType === 'PRE_EVENT' ? 'Pré-Evento' : 'Pós-Evento' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="isLoading" class="loading-state">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Carregando reserva...</p>
      </div>

      <div *ngIf="!isLoading && reservation">
        <div class="summary-card">
          <ion-icon name="calendar-outline"></ion-icon>
          <div>
            <p class="summary-title">{{ spaceLabel }}</p>
            <p class="summary-date">{{ formatDisplayDate(reservation.date) }}</p>
          </div>
        </div>

        <div class="form-section">
          <h3>Observações da Vistoria</h3>
          <ion-textarea [(ngModel)]="notes" placeholder="Descreva o estado do espaço..." [rows]="3"></ion-textarea>
        </div>

        <div class="form-section">
          <h3>Equipamentos ({{ equipmentItems.length }})</h3>
          <app-inspection-item-form
            *ngFor="let item of equipmentItems; let i = index"
            [equipmentName]="item.name"
            [photoUrl]="item.photoUrl"
            [checked]="item.okConfirmed"
            (photoUrlChange)="item.photoUrl = $event"
            (checkedChange)="item.okConfirmed = $event">
          </app-inspection-item-form>
        </div>

        <div class="form-actions">
          <ion-button expand="block" [disabled]="isSubmitting || !isFormValid()" (click)="onSubmit()">
            <ion-spinner *ngIf="isSubmitting" name="crescent"></ion-spinner>
            <span *ngIf="!isSubmitting">Enviar Vistoria</span>
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; gap: 12px; color: rgba(255, 248, 240, 0.82); }
    .summary-card {
      display: flex; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.26); border-radius: 12px; padding: 16px; margin-bottom: 24px;
    }
    .summary-card ion-icon { font-size: 28px; color: var(--ion-color-primary); }
    .summary-title { margin: 0; font-size: 16px; font-weight: 600; color: #fff8f0; }
    .summary-date { margin: 4px 0 0 0; font-size: 13px; color: rgba(255, 248, 240, 0.82); }
    .form-section { margin-bottom: 24px; }
    .form-section h3 {
      font-size: 14px; font-weight: 600; color: rgba(255, 248, 240, 0.86);
      margin: 0 0 12px 4px; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .form-actions { margin-top: 32px; }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, InspectionItemFormComponent]
})
export class VistoriaPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  private uiService = inject(UiService);

  reservationId = '';
  inspectionType: 'PRE_EVENT' | 'POST_EVENT' = 'PRE_EVENT';
  reservation: ReservationResponseDTO | null = null;
  notes = '';
  equipmentItems: EquipmentItem[] = [];
  isLoading = false;
  isSubmitting = false;

  get spaceLabel(): string { return this.reservation ? SPACE_LABELS[this.reservation.space.type as SpaceType] || String(this.reservation.space.type) : ''; }

  ngOnInit(): void {
    this.reservationId = this.route.snapshot.paramMap.get('id') || '';
    this.inspectionType = (this.route.snapshot.queryParamMap.get('type') as 'PRE_EVENT' | 'POST_EVENT') || 'PRE_EVENT';
    this.loadReservation();
  }

  private loadReservation(): void {
    this.isLoading = true;
    this.reservationService.getById(this.reservationId).pipe(
      catchError(() => { this.uiService.showSuccess('Reserva não encontrada.'); this.router.navigate(['/funcionario/reservas']); return of(null); }),
      finalize(() => this.isLoading = false)
    ).subscribe(r => {
      if (r) {
        this.reservation = r;
        const catalog = SPACE_EQUIPMENT_CATALOG[r.space.type as SpaceType] || [];
        this.equipmentItems = catalog.map(name => ({ name, okConfirmed: true, photoUrl: '' }));
      }
    });
  }

  formatDisplayDate(d: string): string { return formatDate(d); }

  isFormValid(): boolean { return this.equipmentItems.every(item => item.photoUrl.trim().length > 0); }

  onSubmit(): void {
    if (!this.isFormValid()) return;
    this.isSubmitting = true;
    const items: InspectionItemDTO[] = this.equipmentItems.map(item => ({
      equipmentName: item.name, okConfirmed: item.okConfirmed, photoUrl: item.photoUrl
    }));
    this.reservationService.submitInspection(this.reservationId, this.inspectionType, { notes: this.notes, items }).pipe(
      catchError(e => { this.uiService.showError(e?.error?.message || 'Erro ao enviar vistoria.'); return of(null); }),
      finalize(() => this.isSubmitting = false)
    ).subscribe(r => { if (r !== null) { this.uiService.showSuccess('Vistoria enviada com sucesso!'); this.router.navigate(['/funcionario/reservas']); } });
  }
}

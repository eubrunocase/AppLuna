import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { EquipmentReservationService } from '../../services/equipment-reservation.service';
import { AuthService } from '../../services/auth.service';
import { EquipmentReservationResponseDTO } from '../../core/models';
import { ReservationCardComponent, CardAction } from '../../shared/components/reservation-card/reservation-card.component';
import { SkeletonListComponent } from '../../shared/components/skeleton-list/skeleton-list.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-funcionario-equipamentos',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Equipamentos (TV)</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <app-skeleton-list *ngIf="isLoading"></app-skeleton-list>

      <ion-list *ngIf="!isLoading && reservations.length > 0">
        <app-reservation-card
          *ngFor="let r of reservations"
          type="equipment"
          [equipmentName]="r.equipmentName"
          [residentName]="r.userName"
          [showResident]="true"
          [status]="r.status"
          [date]="r.date"
          [createdAt]="r.createdAt"
          [startTime]="r.startTime"
          [endTime]="r.endTime"
          [pickedUpAt]="r.pickedUpAt ?? null"
          [returnedAt]="r.returnedAt ?? null"
          [canceledAt]="r.canceledAt ?? null"
          [actions]="getActions(r)"
          (actionClick)="onAction($event, r)">
        </app-reservation-card>
      </ion-list>

      <app-empty-state
        *ngIf="!isLoading && reservations.length === 0"
        icon="tv-outline"
        title="Nenhuma reserva de TV"
        message="Reservas de equipamentos aparecerão aqui">
      </app-empty-state>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, ReservationCardComponent, SkeletonListComponent, EmptyStateComponent]
})
export class FuncionarioEquipamentosPage implements OnInit {
  private equipmentService = inject(EquipmentReservationService);

  reservations: EquipmentReservationResponseDTO[] = [];
  isLoading = false;

  ngOnInit(): void { this.loadReservations(); }
  ionViewWillEnter(): void { this.loadReservations(); }

  loadReservations(): void {
    this.isLoading = true;
    this.equipmentService.list().pipe(
      catchError(() => of([])),
      finalize(() => this.isLoading = false)
    ).subscribe(r => this.reservations = r);
  }

  refresh(event: any): void { this.loadReservations(); setTimeout(() => event.target.complete(), 1000); }

  getActions(r: EquipmentReservationResponseDTO): CardAction[] {
    return [
      { label: 'Entregar', icon: 'hand-right-outline', color: 'primary', visible: r.status === 'CONFIRMED', disabled: false },
      { label: 'Devolver', icon: 'checkmark-circle-outline', color: 'success', visible: r.status === 'IN_USE', disabled: false }
    ];
  }

  onAction(action: CardAction, r: EquipmentReservationResponseDTO): void {
    if (action.label === 'Entregar') {
      this.equipmentService.handover(r.id).pipe(catchError(() => of(null))).subscribe(() => this.loadReservations());
    }
    if (action.label === 'Devolver') {
      this.equipmentService.returnItem(r.id).pipe(catchError(() => of(null))).subscribe(() => this.loadReservations());
    }
  }
}

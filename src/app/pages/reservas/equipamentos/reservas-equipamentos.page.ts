import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EquipmentReservationService } from '../../../services/equipment-reservation.service';
import { EquipmentReservationResponseDTO } from '../../../core/models';
import { ReservationCardComponent, CardAction } from '../../../shared/components/reservation-card/reservation-card.component';
import { SkeletonListComponent } from '../../../shared/components/skeleton-list/skeleton-list.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-reservas-equipamentos',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Reservar TV</ion-title>
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
        message="Você ainda não possui reservas da TV">
      </app-empty-state>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="openNew()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, ReservationCardComponent, SkeletonListComponent, EmptyStateComponent]
})
export class ReservasEquipamentosPage implements OnInit {
  private equipmentService = inject(EquipmentReservationService);
  private router = inject(Router);

  reservations: EquipmentReservationResponseDTO[] = [];
  isLoading = false;

  ngOnInit(): void { this.loadReservations(); }
  ionViewWillEnter(): void { this.loadReservations(); }

  loadReservations(): void {
    this.isLoading = true;
    this.equipmentService.listMine().pipe(
      catchError(() => of([])),
      finalize(() => this.isLoading = false)
    ).subscribe(r => this.reservations = r);
  }

  refresh(event: any): void {
    this.loadReservations();
    setTimeout(() => event.target.complete(), 1000);
  }

  openNew(): void { this.router.navigate(['/reservas/equipamentos/nova']); }

  getActions(r: EquipmentReservationResponseDTO): CardAction[] {
    return [{
      label: 'Cancelar Reserva',
      icon: 'ban-outline',
      color: 'danger',
      fill: 'outline',
      visible: r.status === 'CONFIRMED',
      disabled: false
    }];
  }

  onAction(action: CardAction, r: EquipmentReservationResponseDTO): void {
    if (action.label === 'Cancelar Reserva') {
      this.equipmentService.cancel(r.id).pipe(catchError(() => of(null)))
        .subscribe(() => this.loadReservations());
    }
  }
}

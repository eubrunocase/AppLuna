import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservationService } from '../../../services/reservation.service';
import { AuthService } from '../../../services/auth.service';
import { ReservationResponseDTO } from '../../../core/models';
import { ReservationCardComponent, CardAction } from '../../../shared/components/reservation-card/reservation-card.component';
import { SkeletonListComponent } from '../../../shared/components/skeleton-list/skeleton-list.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-reservas-espacos',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Reservas de Espaços</ion-title>
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
          type="space"
          [spaceType]="getStringType(r.space.type)"
          [residentName]="r.user.name"
          [showResident]="false"
          [status]="r.status"
          [date]="r.date"
          [createdAt]="r.createdAt"
          [actions]="getActions(r)"
          (cardClick)="openDetail(r)"
          (actionClick)="onAction($event, r)">
        </app-reservation-card>
      </ion-list>

      <app-empty-state
        *ngIf="!isLoading && reservations.length === 0"
        icon="calendar-outline"
        title="Nenhuma reserva encontrada"
        message="Suas reservas de espaço aparecerão aqui">
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
export class ReservasEspacosPage implements OnInit {
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  reservations: ReservationResponseDTO[] = [];
  isLoading = false;

  getStringType(type: any): string { return String(type); }

  ngOnInit(): void {
    this.loadReservations();
  }

  ionViewWillEnter(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) { this.isLoading = false; return; }

    this.reservationService.getByUser(currentUser.id).pipe(
      catchError(() => of([])),
      finalize(() => this.isLoading = false)
    ).subscribe(res => this.reservations = res);
  }

  refresh(event: any): void {
    this.loadReservations();
    setTimeout(() => event.target.complete(), 1000);
  }

  openDetail(r: ReservationResponseDTO): void {
    this.router.navigate(['/reservas/espacos', r.id]);
  }

  openNew(): void {
    this.router.navigate(['/reservas/espacos/nova']);
  }

  getActions(r: ReservationResponseDTO): CardAction[] {
    return [
      {
        label: 'Assinar Termo',
        icon: 'document-text-outline',
        color: 'warning',
        visible: r.status === 'AWAITING_SIGNATURE',
        disabled: false
      },
      {
        label: 'Cancelar',
        icon: 'ban-outline',
        color: 'danger',
        fill: 'outline',
        visible: r.status === 'PENDING' || r.status === 'APPROVED',
        disabled: false
      }
    ];
  }

  onAction(action: CardAction, r: ReservationResponseDTO): void {
    if (action.label === 'Cancelar') this.cancelReservation(r);
    if (action.label === 'Assinar Termo') this.router.navigate(['/reservas/espacos', r.id, 'termo']);
  }

  private cancelReservation(r: ReservationResponseDTO): void {
    this.reservationService.delete(r.id).pipe(
      catchError(() => of(null))
    ).subscribe(() => this.loadReservations());
  }
}

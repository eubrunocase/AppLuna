import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../shared/services/ui.service';
import { ReservationResponseDTO } from '../../core/models';
import { ReservationCardComponent, CardAction } from '../../shared/components/reservation-card/reservation-card.component';
import { SkeletonListComponent } from '../../shared/components/skeleton-list/skeleton-list.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-funcionario-reservas',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ isAdmin ? 'Reservas do Condomínio' : 'Reservas' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div *ngIf="isAdmin && pendingCount > 0" class="pending-banner">
        <ion-icon name="alert-circle-outline"></ion-icon>
        <span><strong>{{ pendingCount }}</strong> reserva(s) aguardam sua decisão</span>
        <ion-button size="small" fill="clear" color="dark" (click)="focusPending()">Revisar</ion-button>
      </div>

      <app-skeleton-list *ngIf="isLoading"></app-skeleton-list>

      <ion-list *ngIf="!isLoading && filteredReservations.length > 0">
        <app-reservation-card
          *ngFor="let r of filteredReservations"
          type="space"
          [spaceType]="getStringType(r.space.type)"
          [residentName]="r.user.name"
          [showResident]="isAdmin"
          [status]="r.status"
          [date]="r.date"
          [createdAt]="r.createdAt"
          [pendingHighlight]="isAdmin && r.status === 'PENDING'"
          [actions]="getActions(r)"
          (cardClick)="openDetail(r)"
          (actionClick)="onAction($event, r)">
        </app-reservation-card>
      </ion-list>

      <app-empty-state
        *ngIf="!isLoading && filteredReservations.length === 0"
        icon="calendar-outline"
        title="Nenhuma reserva encontrada"
        message="As reservas aparecerão aqui">
      </app-empty-state>
    </ion-content>
  `,
  styles: [`
    .pending-banner {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px;
      background: var(--ion-color-warning); color: #000; border-radius: 12px; margin-bottom: 16px; font-size: 13px;
    }
    .pending-banner ion-icon { font-size: 20px; }
    .pending-banner span { flex: 1; }
    .pending-banner strong { font-size: 16px; margin-right: 4px; }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, ReservationCardComponent, SkeletonListComponent, EmptyStateComponent]
})
export class FuncionarioReservasPage implements OnInit {
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);
  private alertController = inject(AlertController);
  private uiService = inject(UiService);
  private router = inject(Router);

  reservations: ReservationResponseDTO[] = [];
  filteredReservations: ReservationResponseDTO[] = [];
  isLoading = false;
  isAdmin = false;
  processingId: string | null = null;

  get pendingCount(): number { return this.reservations.filter(r => r.status === 'PENDING').length; }

  getStringType(type: any): string { return String(type); }

  ngOnInit(): void { this.isAdmin = this.authService.isAdmin(); this.loadReservations(); }
  ionViewWillEnter(): void { this.loadReservations(); }

  loadReservations(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) { this.isLoading = false; return; }

    if (this.isAdmin) {
      this.reservationService.getAll().pipe(
        catchError(() => of([] as ReservationResponseDTO[])),
        finalize(() => this.isLoading = false)
      ).subscribe(res => {
        this.reservations = res.filter(r => r.space.type !== 'CAMPO_FUTEBOL');
        this.filteredReservations = [...this.reservations];
      });
    } else {
      this.isLoading = false;
      this.reservations = [];
      this.filteredReservations = [];
    }
  }

  refresh(event: any): void { this.loadReservations(); setTimeout(() => event.target.complete(), 1000); }

  focusPending(): void { this.filteredReservations = this.reservations.filter(r => r.status === 'PENDING'); }

  openDetail(r: ReservationResponseDTO): void { this.router.navigate(['/reservas/espacos', r.id]); }

  getActions(r: ReservationResponseDTO): CardAction[] {
    return [
      { label: 'Aprovar', icon: 'checkmark-circle-outline', color: 'success', visible: this.isAdmin && r.status === 'PENDING', disabled: this.processingId === r.id },
      { label: 'Rejeitar', icon: 'close-circle-outline', color: 'danger', fill: 'outline', visible: this.isAdmin && r.status === 'PENDING', disabled: this.processingId === r.id },
      { label: 'Cancelar', icon: 'ban-outline', color: 'medium', fill: 'outline', visible: this.isAdmin && (r.status === 'APPROVED' || r.status === 'CONFIRMED'), disabled: this.processingId === r.id },
      { label: 'Lista de Convidados', icon: 'people-outline', color: 'tertiary', fill: 'outline', visible: r.status === 'CONFIRMED' && (r.space.type === 'SALAO_FESTAS' || r.space.type === 'CHURRASQUEIRA'), disabled: false }
    ];
  }

  async onAction(action: CardAction, r: ReservationResponseDTO): Promise<void> {
    if (action.label === 'Aprovar') this.approve(r);
    if (action.label === 'Rejeitar') await this.reject(r);
    if (action.label === 'Cancelar') this.cancel(r);
    if (action.label === 'Lista de Convidados') this.router.navigate(['/funcionario/reservas', r.id, 'convidados']);
  }

  approve(r: ReservationResponseDTO): void {
    this.processingId = r.id;
    this.reservationService.approve(r.id).pipe(
      catchError(e => { this.uiService.showError(e?.message || 'Erro ao aprovar.'); return of(null); }),
      finalize(() => this.processingId = null)
    ).subscribe(upd => { if (upd) { this.loadReservations(); this.uiService.showSuccess(`Reserva de ${upd.user.name} aprovada.`); } });
  }

  async reject(r: ReservationResponseDTO): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Rejeitar reserva',
      message: `Confirma a rejeição da reserva de <strong>${r.user.name}</strong>?`,
      buttons: [{ text: 'Voltar', role: 'cancel' }, { text: 'Rejeitar', role: 'destructive', handler: () => this.doReject(r) }]
    });
    await alert.present();
  }

  private doReject(r: ReservationResponseDTO): void {
    this.processingId = r.id;
    this.reservationService.reject(r.id).pipe(
      catchError(e => { this.uiService.showError(e?.message || 'Erro ao rejeitar.'); return of(null); }),
      finalize(() => this.processingId = null)
    ).subscribe(upd => { if (upd) { this.loadReservations(); this.uiService.showSuccess(`Reserva de ${upd.user.name} rejeitada.`); } });
  }

  private cancel(r: ReservationResponseDTO): void {
    this.processingId = r.id;
    this.reservationService.delete(r.id).pipe(
      catchError(() => of(null)),
      finalize(() => this.processingId = null)
    ).subscribe(() => this.loadReservations());
  }
}

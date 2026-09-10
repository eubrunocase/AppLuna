import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../../services/reservation.service';
import { UiService } from '../../../shared/services/ui.service';
import { catchError, finalize, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-termo-responsabilidade',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button [defaultHref]="'/reservas/espacos/' + reservationId"></ion-back-button>
        </ion-buttons>
        <ion-title>Termo de Responsabilidade</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="isLoading" class="loading-state">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div *ngIf="!isLoading && termContent" class="term-content">
        <div class="term-text" [innerHTML]="termContent"></div>

        <div class="sign-actions">
          <ion-button expand="block" [disabled]="isSubmitting" (click)="signTerm()">
            <ion-spinner *ngIf="isSubmitting" name="crescent"></ion-spinner>
            <ion-icon *ngIf="!isSubmitting" slot="start" name="document-text-outline"></ion-icon>
            <span *ngIf="!isSubmitting">Assinar e Confirmar</span>
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .loading-state { display: flex; justify-content: center; padding: 48px; }
    .term-content { padding: 8px 0; }
    .term-text {
      background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.26);
      border-radius: 12px; padding: 20px; margin-bottom: 24px;
      font-size: 14px; line-height: 1.6; color: rgba(255, 248, 240, 0.86);
    }
    .sign-actions { margin-top: 16px; }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class TermoResponsabilidadePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  private uiService = inject(UiService);

  reservationId = '';
  termContent = '';
  isLoading = false;
  isSubmitting = false;

  ngOnInit(): void {
    this.reservationId = this.route.snapshot.paramMap.get('id') || '';
    this.loadTerm();
  }

  private loadTerm(): void {
    this.isLoading = true;
    this.reservationService.getById(this.reservationId).pipe(
      catchError(() => { this.router.navigate(['/reservas/espacos']); return of(null); }),
      finalize(() => this.isLoading = false)
    ).subscribe(r => {
      if (r?.liabilityTerm) {
        this.termContent = r.liabilityTerm.content;
      } else {
        this.termContent = '<p>Termo de responsabilidade não disponível.</p>';
      }
    });
  }

  signTerm(): void {
    this.isSubmitting = true;
    this.reservationService.signLiabilityTerm(this.reservationId).pipe(
      catchError(e => { this.uiService.showError(e?.error?.message || 'Erro ao assinar termo.'); return of(null); }),
      finalize(() => this.isSubmitting = false)
    ).subscribe(r => {
      if (r !== null) {
        this.uiService.showSuccess('Termo assinado com sucesso!');
        this.router.navigate(['/reservas/espacos', this.reservationId]);
      }
    });
  }
}

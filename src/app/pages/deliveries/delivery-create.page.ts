import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeliveryService } from '../../services/delivery.service';
import { UserService } from '../../services/user.service';
import { UiService } from '../../shared/services/ui.service';
import { ResponseUserDTO, UserRoles } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-delivery-create',
  template: `
    <app-page-header title="Nova Encomenda" [showBack]="true" backHref="/deliveries" />

    <ion-content class="ion-padding">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">

        <div class="form-section">
          <h3>Destinatário</h3>
          <div class="select-wrapper">
            <ion-icon name="person-outline" class="select-icon"></ion-icon>
            <select formControlName="user" class="native-select">
              <option value="" disabled selected>Selecione o morador</option>
              <option *ngFor="let u of users" [value]="u.id">
                {{ u.name }} — Apto {{ u.apartment }}
              </option>
            </select>
            <ion-icon name="chevron-down-outline" class="chevron"></ion-icon>
          </div>
          <p class="field-error" *ngIf="form.get('user')?.touched && form.get('user')?.invalid">
            Selecione o destinatário
          </p>
        </div>

        <div class="form-section">
          <h3>Número de Protocolo</h3>
          <div class="input-wrapper">
            <ion-icon name="barcode-outline" class="input-icon"></ion-icon>
            <input
              formControlName="protocolNumber"
              type="text"
              placeholder="Ex: 202406001 (opcional)"
              class="native-input"
            />
          </div>
        </div>

        <div class="form-section">
          <h3>Descrição</h3>
          <div class="input-wrapper">
            <ion-icon name="cube-outline" class="input-icon"></ion-icon>
            <input
              formControlName="discrimination"
              type="text"
              placeholder="Ex: Caixa, envelope, sacola… (opcional)"
              class="native-input"
            />
          </div>
        </div>

        <div class="form-section">
          <h3>Recebido por (portaria)</h3>
          <div class="input-wrapper">
            <ion-icon name="shield-checkmark-outline" class="input-icon"></ion-icon>
            <input
              formControlName="otherRecipient"
              type="text"
              placeholder="Nome de quem recebeu (opcional)"
              class="native-input"
            />
          </div>
        </div>

        <div class="form-actions">
          <ion-button
            expand="block"
            type="submit"
            [disabled]="isSubmitting || form.invalid">
            <ion-spinner *ngIf="isSubmitting" name="crescent"></ion-spinner>
            <ion-icon *ngIf="!isSubmitting" slot="start" name="add-circle-outline"></ion-icon>
            <span *ngIf="!isSubmitting">Registrar Encomenda</span>
          </ion-button>
        </div>

      </form>
    </ion-content>
  `,
  styles: [`
    .form-section {
      margin-bottom: 24px;
    }

    .form-section h3 {
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 248, 240, 0.7);
      margin: 0 0 10px 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .select-wrapper, .input-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.26);
      border-radius: 12px;
      padding: 14px 16px;
    }

    .select-icon, .input-icon {
      font-size: 20px;
      color: var(--ion-color-primary);
      flex-shrink: 0;
    }

    .chevron {
      font-size: 16px;
      color: rgba(255, 248, 240, 0.6);
      flex-shrink: 0;
    }

    .native-select {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #fff8f0;
      font-size: 15px;
      appearance: none;
      -webkit-appearance: none;
      cursor: pointer;
    }

    .native-select option {
      background: #1a1a2e;
      color: #fff8f0;
    }

    .native-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #fff8f0;
      font-size: 15px;
    }

    .native-input::placeholder {
      color: rgba(255, 248, 240, 0.45);
    }

    .field-error {
      margin: 6px 0 0 4px;
      font-size: 12px;
      color: var(--ion-color-danger);
    }

    .form-actions {
      margin-top: 32px;
    }

    ion-button {
      --border-radius: 12px;
      height: 52px;
      font-weight: 600;
      font-size: 16px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, PageHeaderComponent]
})
export class DeliveryCreatePage implements OnInit {
  private fb = inject(FormBuilder);
  private deliveryService = inject(DeliveryService);
  private userService = inject(UserService);
  private router = inject(Router);
  private uiService = inject(UiService);

  users: ResponseUserDTO[] = [];
  isSubmitting = false;

  form: FormGroup = this.fb.group({
    user: ['', Validators.required],
    protocolNumber: [null],
    discrimination: [null],
    otherRecipient: [null]
  });

  ngOnInit(): void {
    this.userService.getAll().pipe(
      map(users => users.filter(u => u.role === UserRoles.RESIDENTE_ROLE)),
      catchError(() => of([]))
    ).subscribe(users => {
      this.users = users;
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { user, protocolNumber, discrimination, otherRecipient } = this.form.value;

    this.deliveryService.create({
      user,
      protocolNumber: protocolNumber || null,
      discrimination: discrimination || null,
      otherRecipient: otherRecipient || null
    }).pipe(
      catchError(err => {
        this.uiService.showError(err.error?.message || 'Erro ao registrar encomenda');
        return of(null);
      })
    ).subscribe(async result => {
      this.isSubmitting = false;
      if (result) {
        await this.uiService.showSuccess('Encomenda registrada com sucesso!');
        this.router.navigate(['/deliveries']);
      }
    });
  }
}

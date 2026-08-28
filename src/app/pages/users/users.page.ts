import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { ResponseUserDTO, UserRoles } from '../../core/models';
import { AlertController } from '@ionic/angular';
import { AppShellService } from '../../core/shell/app-shell.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-users',
  template: `
    <ion-content class="shell-page-content ion-padding">
      <ion-button expand="block" class="create-top-btn" (click)="openCreateModal()">
        <ion-icon slot="start" name="person-add-outline"></ion-icon>
        Novo usuário
      </ion-button>

      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div *ngIf="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <ion-list *ngIf="!isLoading && users.length > 0">
        <ion-item *ngFor="let user of users" class="user-item">
          <ion-avatar slot="start">
            <ion-icon name="person-circle-outline" class="avatar-icon"></ion-icon>
          </ion-avatar>
          <ion-label>
            <h2>{{ user.name }}</h2>
            <p>{{ user.apartment }} - {{ user.email }}</p>
            <ion-chip [color]="getRoleColor(user.role)" size="small">
              {{ getRoleLabel(user.role) }}
            </ion-chip>
          </ion-label>
          <ion-buttons slot="end">
            <ion-button (click)="openEditModal(user)">
              <ion-icon slot="icon-only" name="create-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-item>
      </ion-list>

      <div *ngIf="!isLoading && users.length === 0" class="empty-state">
        <ion-icon name="people-outline" class="empty-icon"></ion-icon>
        <p>Nenhum usuário encontrado</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    
    .user-item {
      --padding-start: 8px;
      --inner-padding-end: 8px;
    }
    
    .avatar-icon {
      font-size: 40px;
      color: var(--ion-color-medium);
    }
    
    ion-label h2 {
      font-weight: 600;
    }
    
    ion-label p {
      color: var(--ion-color-medium);
      font-size: 13px;
    }
    
    ion-chip {
      margin-top: 4px;
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: var(--ion-color-medium);
    }
    
    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class UsersPage implements OnInit, ViewWillEnter {
  private userService = inject(UserService);
  private alertController = inject(AlertController);
  private shell = inject(AppShellService);

  users: ResponseUserDTO[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  ionViewWillEnter(): void {
    this.shell.configure({
      title: 'Gerenciar Usuários',
      showBack: true,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
    });
    this.shell.setExpandContent(null);
  }

  loadUsers(): void {
    this.isLoading = true;
    
    this.userService.getAll().pipe(
      catchError(() => of([])),
      finalize(() => this.isLoading = false)
    ).subscribe(users => {
      this.users = users;
    });
  }

  refresh(event: any): void {
    this.loadUsers();
    setTimeout(() => event.target.complete(), 1000);
  }

  getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      [UserRoles.ADMIN_ROLE]: 'danger',
      [UserRoles.EMPLOYEE]: 'warning',
      [UserRoles.RESIDENT_ROLE]: 'primary'
    };
    return colors[role] || 'medium';
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      [UserRoles.ADMIN_ROLE]: 'Administrador',
      [UserRoles.EMPLOYEE]: 'Funcionário',
      [UserRoles.RESIDENT_ROLE]: 'Morador'
    };
    return labels[role] || role;
  }

  async openCreateModal(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Novo Usuário',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nome completo' },
        { name: 'apartment', type: 'text', placeholder: 'Apartamento (ex: 101)' },
        { name: 'email', type: 'email', placeholder: 'Email' },
        { name: 'password', type: 'password', placeholder: 'Senha' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Avançar',
          handler: (data) => {
            if (data.name && data.apartment && data.email && data.password) {
              this.selectRole(data);
              return true;
            }
            return false;
          }
        }
      ]
    });
    await alert.present();
  }

  private async selectRole(basicData: any): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Selecione o Perfil',
      inputs: [
        {
          name: 'role',
          type: 'radio',
          label: 'Morador',
          value: UserRoles.RESIDENT_ROLE
        },
        {
          name: 'role',
          type: 'radio',
          label: 'Funcionário',
          value: UserRoles.EMPLOYEE
        },
        {
          name: 'role',
          type: 'radio',
          label: 'Administrador',
          value: UserRoles.ADMIN_ROLE
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Criar',
          handler: (roleData) => {
            if (roleData.role) {
              this.createUser({ ...basicData, role: roleData.role });
              return true;
            }
            return false;
          }
        }
      ]
    });
    await alert.present();
  }

  async openEditModal(user: ResponseUserDTO): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Editar Usuário',
      message: user.email,
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nome completo', value: user.name },
        { name: 'apartment', type: 'text', placeholder: 'Apartamento', value: user.apartment },
        { name: 'password', type: 'password', placeholder: 'Nova senha (deixe em branco para manter)' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: (data) => {
            if (data.name && data.apartment) {
              this.updateUser(user, data);
              return true;
            }
            return false;
          }
        }
      ]
    });
    await alert.present();
  }

  private createUser(data: any): void {
    this.userService.create({
      name: data.name,
      apartment: data.apartment,
      email: data.email,
      password: data.password,
      role: data.role
    }).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.loadUsers();
    });
  }

  private updateUser(user: ResponseUserDTO, data: any): void {
    this.userService.update(user.id, {
      name: data.name,
      apartment: data.apartment,
      email: user.email,
      password: data.password || '',
      role: user.role
    }).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.loadUsers();
    });
  }
}

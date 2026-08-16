import { Routes } from '@angular/router';
import { authGuard, adminGuard, roleGuard } from './core/guards/auth.guard';
import { UserRoles } from './core/models';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'home',
    redirectTo: 'tabs/home',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./pages/tabs/home-tab/home-tab.page').then(m => m.HomeTabPage),
        canActivate: [authGuard]
      },
      {
        path: 'reservations',
        loadComponent: () => import('./pages/tabs/reservations-tab/reservations-tab.page').then(m => m.ReservationsTabPage),
        canActivate: [roleGuard([UserRoles.ADMIN_ROLE, UserRoles.RESIDENT_ROLE])]
      },
      {
        path: 'deliveries',
        loadComponent: () => import('./pages/tabs/deliveries-tab/deliveries-tab.page').then(m => m.DeliveriesTabPage),
        canActivate: [authGuard]
      },
      {
        path: 'occurrences',
        loadComponent: () => import('./pages/tabs/occurrences-tab/occurrences-tab.page').then(m => m.OccurrencesTabPage),
        canActivate: [roleGuard([UserRoles.ADMIN_ROLE, UserRoles.RESIDENT_ROLE])]
      },
    ]
  },
  {
    path: 'reservations',
    loadComponent: () => import('./pages/reservations/reservations.page').then(m => m.ReservationsPage),
    canActivate: [roleGuard([UserRoles.ADMIN_ROLE, UserRoles.RESIDENT_ROLE])]
  },
  {
    path: 'deliveries',
    loadComponent: () => import('./pages/deliveries/deliveries.page').then(m => m.DeliveriesPage),
    canActivate: [authGuard]
  },
  {
    path: 'deliveries/new',
    loadComponent: () => import('./pages/deliveries/delivery-create.page').then(m => m.DeliveryCreatePage),
    canActivate: [roleGuard([UserRoles.ADMIN_ROLE, UserRoles.EMPLOYEE])]
  },
  {
    path: 'occurrences',
    loadComponent: () => import('./pages/occurrences/occurrences.page').then(m => m.OccurrencesPage),
    canActivate: [roleGuard([UserRoles.ADMIN_ROLE, UserRoles.RESIDENT_ROLE])]
  },
  {
    path: 'equipment-reservations',
    loadComponent: () => import('./pages/equipment-reservations/equipment-reservations.page').then(m => m.EquipmentReservationsPage),
    canActivate: [roleGuard([UserRoles.ADMIN_ROLE, UserRoles.EMPLOYEE])]
  },
  {
    path: 'equipment-reservations/new',
    loadComponent: () => import('./pages/equipment-reservations/equipment-reservation-create.page').then(m => m.EquipmentReservationCreatePage),
    canActivate: [roleGuard([UserRoles.ADMIN_ROLE, UserRoles.RESIDENT_ROLE])]
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/users.page').then(m => m.UsersPage),
    canActivate: [adminGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports.page').then(m => m.ReportsPage),
    canActivate: [adminGuard]
  },
  {
    path: 'push-notifications',
    loadComponent: () => import('./pages/push-notifications/push-notifications.page').then(m => m.PushNotificationsPage),
    canActivate: [authGuard]
  },
  {
    path: 'reservations/new',
    loadComponent: () => import('./pages/reservations/reservation-create.page').then(m => m.ReservationCreatePage),
    canActivate: [roleGuard([UserRoles.ADMIN_ROLE, UserRoles.RESIDENT_ROLE])]
  },
  {
    path: 'occurrences/new',
    loadComponent: () => import('./pages/occurrences/occurrence-create.page').then(m => m.OccurrenceCreatePage),
    canActivate: [roleGuard([UserRoles.ADMIN_ROLE, UserRoles.RESIDENT_ROLE])]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

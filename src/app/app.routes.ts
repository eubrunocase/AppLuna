import { Routes } from '@angular/router';
import { authGuard, adminGuard, roleGuard, guestGuard } from './core/guards/auth.guard';
import { UserRoles } from './core/models';
import { AppShellComponent } from './core/shell/app-shell.component';

const residentOrAdmin = roleGuard([UserRoles.ADMIN_ROLE, UserRoles.RESIDENT_ROLE]);
const adminOrEmployee = roleGuard([UserRoles.ADMIN_ROLE, UserRoles.EMPLOYEE]);

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
    canActivate: [guestGuard],
  },
  {
    path: 'app',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      // --- Home stack ---
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/tabs/home-tab/home-tab.page').then((m) => m.HomeTabPage),
      },
      {
        path: 'home/reservation/new/space',
        loadComponent: () =>
          import('./pages/reservations/reservation-space-step.page').then(
            (m) => m.ReservationSpaceStepPage,
          ),
        canActivate: [residentOrAdmin],
      },
      {
        path: 'home/reservation/new/date/:spaceId',
        loadComponent: () =>
          import('./pages/reservations/reservation-date-step.page').then(
            (m) => m.ReservationDateStepPage,
          ),
        canActivate: [residentOrAdmin],
      },
      {
        path: 'home/tv/new',
        loadComponent: () =>
          import('./pages/equipment-reservations/equipment-reservation-create.page').then(
            (m) => m.EquipmentReservationCreatePage,
          ),
        canActivate: [residentOrAdmin],
      },
      {
        path: 'home/occurrence/new',
        loadComponent: () =>
          import('./pages/occurrences/occurrence-create.page').then(
            (m) => m.OccurrenceCreatePage,
          ),
        canActivate: [residentOrAdmin],
      },
      {
        path: 'home/deliveries/manage',
        loadComponent: () =>
          import('./pages/deliveries/deliveries.page').then((m) => m.DeliveriesPage),
        canActivate: [authGuard],
      },
      {
        path: 'home/deliveries/manage/new',
        loadComponent: () =>
          import('./pages/deliveries/delivery-create.page').then((m) => m.DeliveryCreatePage),
        canActivate: [adminOrEmployee],
      },
      {
        path: 'home/equipment/manage',
        loadComponent: () =>
          import('./pages/equipment-reservations/equipment-reservations.page').then(
            (m) => m.EquipmentReservationsPage,
          ),
        canActivate: [adminOrEmployee],
      },
      {
        path: 'home/admin/users',
        loadComponent: () => import('./pages/users/users.page').then((m) => m.UsersPage),
        canActivate: [adminGuard],
      },
      {
        path: 'home/admin/reports',
        loadComponent: () => import('./pages/reports/reports.page').then((m) => m.ReportsPage),
        canActivate: [adminGuard],
      },
      {
        path: 'home/settings/notifications',
        loadComponent: () =>
          import('./pages/push-notifications/push-notifications.page').then(
            (m) => m.PushNotificationsPage,
          ),
        canActivate: [authGuard],
      },

      // --- Reservations stack ---
      {
        path: 'reservations',
        loadComponent: () =>
          import('./pages/tabs/reservations-tab/reservations-tab.page').then(
            (m) => m.ReservationsTabPage,
          ),
        canActivate: [residentOrAdmin],
      },
      {
        path: 'reservations/new/space',
        loadComponent: () =>
          import('./pages/reservations/reservation-space-step.page').then(
            (m) => m.ReservationSpaceStepPage,
          ),
        canActivate: [residentOrAdmin],
      },
      {
        path: 'reservations/new/date/:spaceId',
        loadComponent: () =>
          import('./pages/reservations/reservation-date-step.page').then(
            (m) => m.ReservationDateStepPage,
          ),
        canActivate: [residentOrAdmin],
      },

      // --- Deliveries stack ---
      {
        path: 'deliveries',
        loadComponent: () =>
          import('./pages/tabs/deliveries-tab/deliveries-tab.page').then(
            (m) => m.DeliveriesTabPage,
          ),
      },
      {
        path: 'deliveries/manage',
        loadComponent: () =>
          import('./pages/deliveries/deliveries.page').then((m) => m.DeliveriesPage),
        canActivate: [authGuard],
      },
      {
        path: 'deliveries/new',
        loadComponent: () =>
          import('./pages/deliveries/delivery-create.page').then((m) => m.DeliveryCreatePage),
        canActivate: [adminOrEmployee],
      },

      // --- Occurrences stack ---
      {
        path: 'occurrences',
        loadComponent: () =>
          import('./pages/tabs/occurrences-tab/occurrences-tab.page').then(
            (m) => m.OccurrencesTabPage,
          ),
        canActivate: [residentOrAdmin],
      },
      {
        path: 'occurrences/new',
        loadComponent: () =>
          import('./pages/occurrences/occurrence-create.page').then(
            (m) => m.OccurrenceCreatePage,
          ),
        canActivate: [residentOrAdmin],
      },
    ],
  },

  // Compat redirects (transição)
  { path: 'tabs', redirectTo: '/app/home', pathMatch: 'prefix' },
  { path: 'home', redirectTo: '/app/home', pathMatch: 'full' },
  { path: '', redirectTo: '/app/home', pathMatch: 'full' },
  {
    path: 'not-found',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
  { path: '**', redirectTo: '/not-found' },
];

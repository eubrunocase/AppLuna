/** Catálogo canônico de rotas — única fonte de URLs do app. */
export const APP_ROUTES = {
  login: '/login',
  notFound: '/not-found',
  home: '/app/home',
  reservations: '/app/reservations',
  deliveries: '/app/deliveries',
  occurrences: '/app/occurrences',

  homeReservationSpace: '/app/home/reservation/new/space',
  homeReservationDate: (spaceId: number | string) =>
    `/app/home/reservation/new/date/${spaceId}`,
  homeTvNew: '/app/home/tv/new',
  homeOccurrenceNew: '/app/home/occurrence/new',
  homeDeliveriesManage: '/app/home/deliveries/manage',
  homeDeliveriesNew: '/app/home/deliveries/manage/new',
  homeEquipmentManage: '/app/home/equipment/manage',
  homeAdminUsers: '/app/home/admin/users',
  homeAdminUsersNew: '/app/home/admin/users/new',
  homeAdminUsersEdit: (id: string) => `/app/home/admin/users/${id}`,
  homeAdminReports: '/app/home/admin/reports',
  homeNotifications: '/app/home/settings/notifications',

  reservationsSpace: '/app/reservations/new/space',
  reservationsDate: (spaceId: number | string) =>
    `/app/reservations/new/date/${spaceId}`,

  deliveriesManage: '/app/deliveries/manage',
  deliveriesNew: '/app/deliveries/new',

  occurrencesNew: '/app/occurrences/new',
} as const;

export type AppTabId = 'home' | 'reservations' | 'deliveries' | 'occurrences';

export const TAB_ROOTS: Record<AppTabId, string> = {
  home: APP_ROUTES.home,
  reservations: APP_ROUTES.reservations,
  deliveries: APP_ROUTES.deliveries,
  occurrences: APP_ROUTES.occurrences,
};

/** Resolve a aba ativa a partir da URL. */
export function resolveTabFromUrl(url: string): AppTabId {
  const path = url.split('?')[0];
  if (path.startsWith('/app/reservations')) return 'reservations';
  if (path.startsWith('/app/deliveries')) return 'deliveries';
  if (path.startsWith('/app/occurrences')) return 'occurrences';
  return 'home';
}

/** Verifica se a URL é raiz de alguma aba. */
export function isTabRoot(url: string): boolean {
  const path = url.split('?')[0];
  return Object.values(TAB_ROOTS).includes(path);
}

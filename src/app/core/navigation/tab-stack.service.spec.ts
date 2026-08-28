import { TabStackService } from './tab-stack.service';
import { APP_ROUTES, resolveTabFromUrl } from './app-routes';

describe('TabStackService', () => {
  let service: TabStackService;

  beforeEach(() => {
    service = new TabStackService();
  });

  it('resolve tab from url', () => {
    expect(resolveTabFromUrl('/app/home/reservation/new/space')).toBe('home');
    expect(resolveTabFromUrl('/app/reservations')).toBe('reservations');
    expect(resolveTabFromUrl('/app/deliveries/new')).toBe('deliveries');
  });

  it('preserva pilha ao trocar de aba', () => {
    service.remember('/app/home/deliveries/manage');
    const target = service.switchTab('deliveries', '/app/home/deliveries/manage');
    expect(target).toBe(APP_ROUTES.deliveries);
    service.remember('/app/deliveries/new');
    const back = service.switchTab('home', '/app/deliveries/new');
    expect(back).toBe('/app/home/deliveries/manage');
  });

  it('popToRoot retorna raiz da aba', () => {
    service.remember('/app/home/admin/users');
    expect(service.popToRoot('home')).toBe(APP_ROUTES.home);
  });
});

import { inject, Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { APP_ROUTES, AppTabId, TAB_ROOTS } from './app-routes';
import { TabStackService } from './tab-stack.service';

@Injectable({ providedIn: 'root' })
export class AppNavigationService {
  private readonly router = inject(Router);
  private readonly navController = inject(NavController);
  private readonly tabStacks = inject(TabStackService);

  /** Seleciona aba preservando pilha salva. */
  selectTab(tab: AppTabId): Promise<boolean> {
    const currentUrl = this.router.url;
    const target = this.tabStacks.switchTab(tab, currentUrl);
    return this.navController.navigateRoot(target, { animated: true });
  }

  /** Toque repetido na aba ativa — volta à raiz. */
  selectTabRoot(tab: AppTabId): Promise<boolean> {
    const target = this.tabStacks.popToRoot(tab);
    this.tabStacks.setActiveTab(tab);
    return this.navController.navigateRoot(target, { animated: true });
  }

  /** Empilha nova tela na pilha atual. */
  push(url: string, options?: NavigationExtras): Promise<boolean> {
    return this.navController.navigateForward(url, options).then((ok) => {
      if (ok) this.tabStacks.remember(this.router.url);
      return ok;
    });
  }

  /** Remove o topo da pilha. */
  async pop(fallback?: string): Promise<boolean> {
    try {
      const result = await this.navController.back({ animated: true });
      return result ?? true;
    } catch {
      if (fallback) {
        return this.navController.navigateBack(fallback, { animated: true });
      }
      return false;
    }
  }

  /** Substitui topo da pilha. */
  replace(url: string, options?: NavigationExtras): Promise<boolean> {
    return this.navController.navigateForward(url, {
      ...options,
      replaceUrl: true,
    });
  }

  /** Conclui fluxo e vai para destino com pilha limpa na aba alvo. */
  completeFlow(url: string): Promise<boolean> {
    this.tabStacks.remember(url);
    return this.navController.navigateRoot(url, {
      replaceUrl: true,
      animated: false,
    });
  }

  /** Reset total do app autenticado para a home. */
  resetToHome(): Promise<boolean> {
    this.tabStacks.resetAll();
    return this.navController.navigateRoot(APP_ROUTES.home, {
      replaceUrl: true,
      animated: false,
    });
  }

  /** Logout / sessão expirada. */
  resetApp(): Promise<boolean> {
    this.tabStacks.resetAll();
    return this.navController.navigateRoot(APP_ROUTES.login, {
      replaceUrl: true,
      animated: false,
    });
  }

  /** Navega dentro da mesma aba sem empilhar (ex.: filtros por query). */
  navigateWithinTab(url: string, options?: NavigationExtras): Promise<boolean> {
    return this.router.navigateByUrl(url, options).then((ok) => {
      if (ok) this.tabStacks.remember(this.router.url);
      return ok;
    });
  }

  /** Raiz da aba atual. */
  currentTabRoot(): string {
    return TAB_ROOTS[this.tabStacks.getActiveTab()];
  }

  // --- Compat aliases (transição) ---
  openFlow = (url: string, options?: NavigationExtras) => this.push(url, options);
  withinTabs = (url: string, options?: NavigationExtras) => this.navigateWithinTab(url, options);
  finishTo = (url: string) => this.completeFlow(url);
  backToHome = () => this.resetToHome();
}

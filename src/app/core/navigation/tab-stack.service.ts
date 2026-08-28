import { Injectable } from '@angular/core';
import { AppTabId, TAB_ROOTS, isTabRoot, resolveTabFromUrl } from './app-routes';

/** Preserva a última URL de cada aba (comportamento ERP). */
@Injectable({ providedIn: 'root' })
export class TabStackService {
  private readonly stacks = new Map<AppTabId, string>();
  private activeTab: AppTabId = 'home';

  getActiveTab(): AppTabId {
    return this.activeTab;
  }

  setActiveTab(tab: AppTabId): void {
    this.activeTab = tab;
  }

  remember(url: string): void {
    const tab = resolveTabFromUrl(url);
    this.activeTab = tab;
    this.stacks.set(tab, url);
  }

  getSavedUrl(tab: AppTabId): string {
    return this.stacks.get(tab) ?? TAB_ROOTS[tab];
  }

  resetTab(tab: AppTabId): void {
    this.stacks.set(tab, TAB_ROOTS[tab]);
  }

  resetAll(): void {
    this.stacks.clear();
    this.activeTab = 'home';
  }

  /** Ao tocar na aba ativa, volta à raiz. */
  popToRoot(tab: AppTabId): string {
    this.resetTab(tab);
    return TAB_ROOTS[tab];
  }

  /** Troca de aba: retorna URL salva ou raiz. */
  switchTab(target: AppTabId, currentUrl: string): string {
    if (!isTabRoot(currentUrl)) {
      this.stacks.set(this.activeTab, currentUrl);
    } else {
      this.stacks.set(this.activeTab, currentUrl);
    }
    this.activeTab = target;
    return this.getSavedUrl(target);
  }
}

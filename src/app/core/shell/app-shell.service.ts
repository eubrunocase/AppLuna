import { Injectable, signal } from '@angular/core';
import {
  DEFAULT_SHELL_CONFIG,
  ShellConfig,
  ShellExpandContent,
  ShellHeaderState,
} from './app-shell.types';

@Injectable({ providedIn: 'root' })
export class AppShellService {
  readonly title = signal(DEFAULT_SHELL_CONFIG.title);
  readonly subtitle = signal(DEFAULT_SHELL_CONFIG.subtitle);
  readonly showBack = signal(DEFAULT_SHELL_CONFIG.showBack);
  readonly showLogo = signal(DEFAULT_SHELL_CONFIG.showLogo);
  readonly showLogout = signal(DEFAULT_SHELL_CONFIG.showLogout);
  readonly headerState = signal<ShellHeaderState>(DEFAULT_SHELL_CONFIG.headerState);
  readonly progressStep = signal<number | null>(null);
  readonly progressTotal = signal<number | null>(null);
  readonly expandContent = signal<ShellExpandContent | null>(null);
  readonly headerActions = signal<ShellExpandContent | null>(null);

  configure(config: ShellConfig): void {
    if (config.title !== undefined) this.title.set(config.title);
    if (config.subtitle !== undefined) this.subtitle.set(config.subtitle);
    if (config.showBack !== undefined) this.showBack.set(config.showBack);
    if (config.showLogo !== undefined) this.showLogo.set(config.showLogo);
    if (config.showLogout !== undefined) this.showLogout.set(config.showLogout);
    if (config.headerState !== undefined) this.headerState.set(config.headerState);
    if (config.progressStep !== undefined) this.progressStep.set(config.progressStep);
    if (config.progressTotal !== undefined) this.progressTotal.set(config.progressTotal);
  }

  setExpandContent(content: ShellExpandContent | null): void {
    this.expandContent.set(content);
  }

  setHeaderActions(content: ShellExpandContent | null): void {
    this.headerActions.set(content);
  }

  collapseOnScroll(collapsed: boolean): void {
    const current = this.headerState();
    if (current === 'compact') return;
    this.headerState.set(collapsed ? 'collapsed' : 'expanded');
  }

  clearProgress(): void {
    this.progressStep.set(null);
    this.progressTotal.set(null);
  }

  reset(): void {
    this.title.set(DEFAULT_SHELL_CONFIG.title);
    this.subtitle.set(DEFAULT_SHELL_CONFIG.subtitle);
    this.showBack.set(DEFAULT_SHELL_CONFIG.showBack);
    this.showLogo.set(DEFAULT_SHELL_CONFIG.showLogo);
    this.showLogout.set(DEFAULT_SHELL_CONFIG.showLogout);
    this.headerState.set(DEFAULT_SHELL_CONFIG.headerState);
    this.progressStep.set(null);
    this.progressTotal.set(null);
    this.expandContent.set(null);
    this.headerActions.set(null);
  }
}

import { Type } from '@angular/core';

export type ShellHeaderState = 'expanded' | 'compact' | 'collapsed';

export interface ShellConfig {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showLogo?: boolean;
  showLogout?: boolean;
  headerState?: ShellHeaderState;
  progressStep?: number | null;
  progressTotal?: number | null;
}

export interface ShellExpandContent {
  component: Type<unknown>;
  inputs?: Record<string, unknown>;
}

export const DEFAULT_SHELL_CONFIG: Required<
  Pick<ShellConfig, 'showBack' | 'showLogo' | 'showLogout' | 'headerState'>
> & { title: string; subtitle: string } = {
  title: 'Lunalink',
  subtitle: '',
  showBack: false,
  showLogo: true,
  showLogout: true,
  headerState: 'compact',
};

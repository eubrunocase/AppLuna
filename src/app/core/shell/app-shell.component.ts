import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  viewChild,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideChevronLeft,
  lucideHome,
  lucideMoonStar,
  lucidePackage,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { filter, Subscription } from 'rxjs';
import { AppNavigationService } from '../navigation/app-navigation.service';
import { AppTabId, resolveTabFromUrl } from '../navigation/app-routes';
import { TabStackService } from '../navigation/tab-stack.service';
import { AuthService } from '../../services/auth.service';
import { AppShellService } from './app-shell.service';
import { LogoutConfirmComponent } from '../../shared/components/logout-confirm/logout-confirm.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    IonRouterOutlet,
    NgIcon,
    HlmButtonImports,
    LogoutConfirmComponent,
    NgComponentOutlet,
  ],
  providers: [
    provideIcons({
      lucideMoonStar,
      lucideChevronLeft,
      lucideHome,
      lucideCalendar,
      lucidePackage,
      lucideTriangleAlert,
    }),
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly navigation = inject(AppNavigationService);
  private readonly tabStacks = inject(TabStackService);
  private readonly authService = inject(AuthService);
  readonly shell = inject(AppShellService);

  private readonly shellRoot = viewChild<ElementRef<HTMLElement>>('shellRoot');
  private readonly shellHeader = viewChild<ElementRef<HTMLElement>>('shellHeader');

  canSeeReservations = false;
  canSeeOccurrences = false;
  activeTab: AppTabId = 'home';

  private routerSub?: Subscription;
  private headerObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      this.shell.headerState();
      this.shell.expandContent();
      queueMicrotask(() => this.syncShellMetrics());
    });
  }

  ngOnInit(): void {
    this.refreshRoleVisibility();
    this.syncFromUrl(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.syncFromUrl(e.urlAfterRedirects));
  }

  ngAfterViewInit(): void {
    const headerEl = this.shellHeader()?.nativeElement;
    if (!headerEl) return;

    this.syncShellMetrics();
    this.headerObserver = new ResizeObserver(() => this.syncShellMetrics());
    this.headerObserver.observe(headerEl);
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.headerObserver?.disconnect();
  }

  private syncShellMetrics(): void {
    const headerEl = this.shellHeader()?.nativeElement;
    const shellEl = this.shellRoot()?.nativeElement;
    if (!headerEl || !shellEl) return;

    const headerHeight = `${headerEl.getBoundingClientRect().height}px`;
    shellEl.style.setProperty('--app-header-height', headerHeight);
    document.documentElement.style.setProperty('--app-header-height', headerHeight);
  }

  onBack(): void {
    void this.navigation.pop();
  }

  onTabClick(tab: AppTabId, event: Event): void {
    event.preventDefault();
    if (this.activeTab === tab) {
      void this.navigation.selectTabRoot(tab);
    } else {
      void this.navigation.selectTab(tab);
    }
  }

  isTabActive(tab: AppTabId): boolean {
    return this.activeTab === tab;
  }

  progressSteps(): number[] {
    const total = this.shell.progressTotal();
    if (!total || total < 1) return [];
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  private syncFromUrl(url: string): void {
    this.activeTab = resolveTabFromUrl(url);
    this.tabStacks.setActiveTab(this.activeTab);
    this.tabStacks.remember(url);
    if (!this.isFlowWithProgress(url)) {
      this.shell.clearProgress();
    }
  }

  private isFlowWithProgress(url: string): boolean {
    const path = url.split('?')[0];
    return /\/reservation(s)?\/new\/(space|date)/.test(path)
      || /\/deliveries\/new/.test(path)
      || /\/home\/deliveries\/manage\/new/.test(path);
  }

  private refreshRoleVisibility(): void {
    this.canSeeReservations =
      this.authService.isAdmin() || this.authService.isResident();
    this.canSeeOccurrences =
      this.authService.isAdmin() || this.authService.isResident();
  }
}

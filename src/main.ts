import { defineCustomElements } from '@ionic/pwa-elements/dist/esm/loader.js';
import { bootstrapApplication } from '@angular/platform-browser';

defineCustomElements(window);
import { RouteReuseStrategy, provideRouter, withPreloading } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { isDevMode } from '@angular/core';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { TabPreloadStrategy } from './app/core/navigation/tab-preload.strategy';
import { authInterceptorFn } from './app/core/interceptors/auth.interceptor';
import { refreshInterceptorFn } from './app/core/interceptors/refresh.interceptor';
import { errorInterceptorFn } from './app/core/interceptors/error.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideSpartanHlm(),
    provideRouter(routes, withPreloading(TabPreloadStrategy)),
    provideHttpClient(
      withInterceptors([authInterceptorFn, errorInterceptorFn, refreshInterceptorFn])
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
});

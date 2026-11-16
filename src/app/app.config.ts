import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { appSwitchTransition } from './shared/services/app-switch-transition';
import { eventoAccessInterceptor } from './shared/evento-access/evento-access.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withViewTransitions({ skipInitialTransition: true, onViewTransitionCreated: appSwitchTransition }),
    ),
    provideHttpClient(withInterceptors([eventoAccessInterceptor]))
  ]
};

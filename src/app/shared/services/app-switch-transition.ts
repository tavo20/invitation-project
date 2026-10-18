import { ActivatedRouteSnapshot, ViewTransitionInfo } from '@angular/router';

type EventApp = 'album' | 'music';

const APP_BY_PATH: Record<string, EventApp> = {
  'invitation/galeria/:id': 'album',
  'fiesta/:code': 'music',
};

function appOf(snapshot: ActivatedRouteSnapshot): EventApp | null {
  let route: ActivatedRouteSnapshot | null = snapshot;
  while (route?.firstChild) route = route.firstChild;
  return APP_BY_PATH[route?.routeConfig?.path ?? ''] ?? null;
}

/**
 * Solo anima el paso entre el álbum y la música (como abrir otra app);
 * el resto de la navegación queda igual que antes, sin transición.
 * La animación vive en styles.scss, según `data-app-switch` en <html>.
 */
export function appSwitchTransition({ transition, from, to }: ViewTransitionInfo): void {
  const fromApp = appOf(from);
  const toApp = appOf(to);
  if (!fromApp || !toApp || fromApp === toApp) {
    transition.skipTransition();
    return;
  }
  const html = document.documentElement;
  html.dataset['appSwitch'] = toApp;
  transition.finished.finally(() => delete html.dataset['appSwitch']);
}

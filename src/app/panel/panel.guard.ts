import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PanelAuthService } from './panel-auth.service';

/** Sin sesión, o con contraseña temporal pendiente de cambiar, vuelve a /panel/ingresar. */
export const panelGuard: CanActivateFn = () => {
  const auth = inject(PanelAuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn() || auth.cliente()?.mustChangePassword) {
    return router.createUrlTree(auth.rutaIngreso());
  }
  return true;
};

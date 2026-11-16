import { HttpInterceptorFn } from '@angular/common/http';
import { headersDeAcceso } from './evento-access';

/** Rutas del back que exigen acceso al evento (lista de confirmaciones, mesas, página de novios). */
const PROTEGIDAS = /\/api\/(invitation-confirmation\/(all-by-invitation|by-invitation|update)|mesa\/|novios\/)/;

export const eventoAccessInterceptor: HttpInterceptorFn = (req, next) => {
  if (!PROTEGIDAS.test(req.url)) return next(req);
  const h = headersDeAcceso();
  if (!Object.keys(h).length) return next(req);
  return next(req.clone({ setHeaders: h }));
};

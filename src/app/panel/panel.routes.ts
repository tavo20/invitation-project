import { Routes } from '@angular/router';
import { panelGuard } from './panel.guard';

/** Rutas del panel de clientes: se cargan solo al entrar a /panel. */
export const panelRoutes: Routes = [
    {
        path: 'ingresar',
        loadComponent: () => import('./ingresar/ingresar.component').then(m => m.IngresarComponent),
    },
    {
        // Ingreso con la marca del planner: /panel/ingresar/hilo-rojo
        path: 'ingresar/:marca',
        loadComponent: () => import('./ingresar/ingresar.component').then(m => m.IngresarComponent),
    },
    {
        path: 'eventos/nuevo',
        canActivate: [panelGuard],
        loadComponent: () => import('./nuevo/nuevo-evento.component').then(m => m.NuevoEventoComponent),
    },
    {
        path: 'eventos/:id',
        canActivate: [panelGuard],
        loadComponent: () => import('./detalle/evento-detalle.component').then(m => m.EventoDetalleComponent),
    },
    {
        path: '',
        pathMatch: 'full',
        canActivate: [panelGuard],
        loadComponent: () => import('./inicio/panel-inicio.component').then(m => m.PanelInicioComponent),
    },
];

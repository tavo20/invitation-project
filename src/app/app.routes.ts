import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: ':slug',
        component: HomeComponent
    },
    {
        path: 'Gustavo-Gissel',
        loadComponent: () =>
            import('./plantillas/gustavo-gissel/gustavo-gissel.component')
                .then(m => m.GustavoGisselComponent)
    },
    {
        path: 'Laura-Juan',
        loadComponent: () =>
            import('./plantillas/laura-juan/laura-juan.component')
                .then(m => m.LauraJuanComponent)
    },
    {
        path: 'Mis-XV',
        loadComponent: () =>
            import('./plantillas/xv-elegante/xv-elegante.component')
                .then(m => m.XvEleganteComponent)
    },
    {
        path: 'Mis-XV-Carmesi',
        loadComponent: () =>
            import('./plantillas/xv-carmesi/xv-carmesi.component')
                .then(m => m.XvCarmesiComponent)
    },
    {
        path: 'Mis-XV-Deluxe-Black',
        loadComponent: () =>
            import('./plantillas/xv-deluxe-black/xv-deluxe-black.component')
                .then(m => m.XvDeluxeBlackComponent)
    },
    {
        path: 'Aquarelle ',
        loadComponent: () =>
            import('./plantillas/aquarelle/aquarelle.component')
                .then(m => m.AquarelleComponent)
    }
];

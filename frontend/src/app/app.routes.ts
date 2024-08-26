import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { OverviewComponent } from './overview/overview.component';
import { ArticleComponent } from './article/article.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' }, // Standardroute zum Login
    { path: 'login', component: LoginComponent },
    { path: 'overview', component: OverviewComponent, canActivate: [AuthGuard] },
    { path: 'article', component: ArticleComponent, canActivate: [AuthGuard] },
    // Wildcard für nicht definierte Routen
    { path: '**', redirectTo: '/login' }
];

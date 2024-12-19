import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { OverviewComponent } from './overview/overview.component';
import { ArticlesComponent } from './articles/articles.component';
import { AddArticleComponent } from './add-article/add-article.component';
import { ArticlesDetailsComponent } from './articles-details/articles-details.component';
import { AuthGuard } from './authentication/auth.guard';


export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'overview', component: OverviewComponent, canActivate: [AuthGuard] },
    { path: 'articles', component: ArticlesComponent, canActivate: [AuthGuard] },
  { path: 'add-article', component: AddArticleComponent, canActivate: [AuthGuard] },
  { path: 'articles/:id', component: ArticlesDetailsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];

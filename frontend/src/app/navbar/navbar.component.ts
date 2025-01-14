import { Component, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OverviewStateService } from '../services/overview-state.service';
import { PositionService } from '../services/position.service';
import { DeviceDetectionService } from '../services/device-detection.service';
import { DialogService } from '../services/dialog.service';
import { ThemeService } from '../services/theme.service';
import { filter } from 'rxjs/operators';
import { ArticleService } from '../services/article.service';
import { HeaderService } from '../services/header.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  public readonly enableEdit = this.overviewStateService.enableEdit;
  public readonly isDarkMode = computed(() => this.themeService.getCurrentTheme() === 'dark');
  
  currentRoute: string = '';
  
  constructor(
    private authService: AuthService, 
    private router: Router, 
    private overviewStateService: OverviewStateService, 
    private positionService: PositionService,
    private articleService: ArticleService,
    private headerService: HeaderService,
    public deviceDetectionService: DeviceDetectionService,
    private dialogService: DialogService,
    private themeService: ThemeService
  ) {
    this.currentRoute = this.router.url;
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });
  }

  isOverviewActive(): boolean {
    return this.currentRoute === '/overview';
  }

  isArticlesActive(): boolean {
    return this.currentRoute === '/articles';
  }

  shouldShowOverviewButton(): boolean {
    return !this.deviceDetectionService.isMobileSignal() || !this.currentRoute.includes('/overview');
  }

  shouldShowArticlesButton(): boolean {
    return !this.deviceDetectionService.isMobileSignal() || this.currentRoute.includes('/overview');
  }

  shouldShowEditButton(): boolean {
    return !this.currentRoute.includes('/add-article');
  }

  navigateTo(path: string): void {
    if (this.enableEdit()) {
      this.overviewStateService.toggleEdit();
      this.positionService.saveEditing();
    }
    this.router.navigate([path]);
  }

  toggleEdit(): void {
    if (this.enableEdit()) {
      this.articleService.saveModifications().subscribe({
        next: () => {
          this.overviewStateService.toggleEdit();
          this.positionService.saveEditing();
        },
        error: (error) => {
          console.error('Error saving article modifications:', error);
        }
      });
    } else {
      this.overviewStateService.toggleEdit();
      this.positionService.startEditing();
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  async logout() {
    const confirmed = await this.dialogService.confirm({
      title: 'Person ausloggen',
      confirmText: 'Ausloggen',
      cancelText: 'Abbrechen',
      confirmClass: 'danger'
    });

    if (confirmed) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}

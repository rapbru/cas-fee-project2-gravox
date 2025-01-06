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
import { filter } from 'rxjs/operators';

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
  public readonly shouldShowNavigationButtons = computed(() => 
    !this.enableEdit() || !this.deviceDetectionService.isMobileSignal()
  );
  
  currentRoute: string = '';
  
  constructor(
    private authService: AuthService, 
    private router: Router, 
    private overviewStateService: OverviewStateService, 
    private positionService: PositionService,
    public deviceDetectionService: DeviceDetectionService,
    private dialogService: DialogService
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
    if (!this.deviceDetectionService.isMobileSignal()) return true;
    return !this.currentRoute.includes('/overview');
  }

  shouldShowArticlesButton(): boolean {
    if (!this.deviceDetectionService.isMobileSignal()) return true;
    return this.currentRoute.includes('/overview');
  }

  navigateTo(path: string): void {
    if (this.enableEdit()) {
      this.overviewStateService.toggleEdit();
      this.positionService.saveEditing();
    }
    this.router.navigate([path]);
  }

  async logout() {
    const confirmed = await this.dialogService.confirm({
      title: 'Person ausloggen',
      confirmText: 'Ausloggen',
      cancelText: 'Abbrechen',
      confirmClass: 'danger'
    });

    if (confirmed) {
      this.performLogout();
    }
  }

  private performLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleEdit(): void {
    this.overviewStateService.toggleEdit();

    if (this.overviewStateService.enableEdit()) {
      this.positionService.startEditing();
    } else {
      this.positionService.saveEditing();
    }
  }
}

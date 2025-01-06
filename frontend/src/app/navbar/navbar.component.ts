import { Component, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PositionService } from '../services/position.service';
import { DeviceDetectionService } from '../services/device-detection.service';
import { DialogService } from '../services/dialog.service';
import { EditStateService } from '../services/edit-state.service';
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
  public readonly enableEdit = this.editStateService.enableEdit;
  public readonly shouldShowNavButtons = () => true;
  
  currentRoute: string = '';
  
  constructor(
    private authService: AuthService, 
    private router: Router, 
    private editStateService: EditStateService,
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

  async handleNavigationWithChanges(action: () => void): Promise<void> {
    if (this.enableEdit()) {
      const confirmed = await this.dialogService.confirm({
        title: 'Änderungen speichern?',
        confirmText: 'Speichern',
        cancelText: 'Abbrechen',
        confirmClass: 'vonesco'
      });
      
      if (confirmed) {
        this.saveChanges();
        action();
      }
    } else {
      action();
    }
  }

  navigateTo(path: string): void {
    if (!this.enableEdit()) {
      this.router.navigate([path]);
    }
  }

  async logout() {
    if (!this.enableEdit()) {
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
  }

  private performLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  async toggleEdit(): Promise<void> {
    if (this.enableEdit()) {
      await this.editStateService.cancelEdit();
    } else {
      this.editStateService.startEdit();
    }
  }

  async saveChanges(): Promise<void> {
    this.editStateService.finishEdit();
    // Add any additional save logic here
  }

  async cancelChanges(): Promise<void> {
    this.editStateService.finishEdit();
  }
}

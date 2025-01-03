import { Component, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OverviewStateService } from '../services/overview-state.service';
import { PositionService } from '../services/position.service';
import { DeviceDetectionService } from '../services/device-detection.service';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    MatIconModule, 
    MatButtonModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  public readonly enableEdit = this.overviewStateService.enableEdit;
  public readonly shouldShowNavigationButtons = computed(() => 
    !this.enableEdit() || !this.deviceDetectionService.isMobileSignal()
  );
  
  constructor(
    private authService: AuthService, 
    private router: Router, 
    private overviewStateService: OverviewStateService, 
    private positionService: PositionService,
    private deviceDetectionService: DeviceDetectionService,
    private dialogService: DialogService
  ) {}

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
      } else {
        this.cancelChanges();
      }
      action();
    } else {
      action();
    }
  }

  navigateTo(path: string): void {
    this.handleNavigationWithChanges(() => this.router.navigate([path]));
  }

  logout() {
    this.handleNavigationWithChanges(() => {
      this.authService.logout();
      this.router.navigate(['/login']);
    });
  }

  toggleEdit(): void {
    this.overviewStateService.toggleEdit();

    if (this.overviewStateService.enableEdit()) {
      this.positionService.startEditing();
    } else {
      this.positionService.cancelEditing();
    }
  }

  saveChanges(): void {
    this.overviewStateService.toggleEdit();
    this.positionService.saveEditing();
  }

  cancelChanges(): void {
    this.overviewStateService.toggleEdit();
    this.positionService.cancelEditing();
  }
}

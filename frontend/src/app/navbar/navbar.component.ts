import { Component, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OverviewStateService } from '../services/overview-state.service';
import { PositionService } from '../services/position.service';
import { CommonModule } from '@angular/common';
import { DeviceDetectionService } from '../services/device-detection.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
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
    private deviceDetectionService: DeviceDetectionService
  ) {}

  logout() {
    if (this.enableEdit()) {
      this.cancelChanges();
    }
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleEdit() {
    this.overviewStateService.toggleEdit();

    if (this.overviewStateService.enableEdit()) {
      this.positionService.startEditing();
    } else {
      this.positionService.cancelEditing();
    }
  }

  saveChanges() {
    // Add any save logic here
    this.overviewStateService.toggleEdit();
    this.positionService.saveEditing();
  }

  cancelChanges() {
    this.overviewStateService.toggleEdit();
    this.positionService.cancelEditing();
  }

  navigateTo(path: string): void {
    if (this.enableEdit()) {
      this.cancelChanges();
    }
    this.router.navigate([path]);
  }
}

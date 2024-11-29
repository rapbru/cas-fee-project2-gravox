import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OverviewStateService } from '../services/overview-state.service';
import { PositionService } from '../services/position.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  public readonly enableEdit = this.overviewStateService.enableEdit;
  
  constructor(private authService: AuthService, private router: Router, private overviewStateService: OverviewStateService, private positionService: PositionService) {}

  logout() {
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
}

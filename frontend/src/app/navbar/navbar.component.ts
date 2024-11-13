import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EditStateService } from '../services/edit-state.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  constructor(private authService: AuthService, private router: Router, public editStateService: EditStateService) {}

  editEnabled = false;

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleEdit() {
    this.editStateService.toggleEdit();
  }

  enableEdit() {
    return this.editStateService.enableEdit();
  }
}

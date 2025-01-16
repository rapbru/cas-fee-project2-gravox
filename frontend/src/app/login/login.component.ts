import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/overview']);
    }
  }

  login() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Invalid username or password';
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.router.navigate(['/overview']);
      },
      error: () => {
        this.errorMessage = 'Invalid username or password';
      }
    });
  }
}

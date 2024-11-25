import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  constructor(private snackBar: MatSnackBar) {}

  showError(message: string, duration = 5000) {
    this.snackBar.open(message, 'Schliessen', {
      duration: duration,
      panelClass: ['error-snackbar']
    });
  }

  showSuccess(message: string, duration = 3000) {
    this.snackBar.open(message, 'Schliessen', {
      duration: duration,
      panelClass: ['success-snackbar']
    });
  }
} 
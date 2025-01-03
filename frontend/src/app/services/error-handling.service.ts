import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  constructor(private snackBar: MatSnackBar) {}

  showError(message: string, error?: any): void {
    console.error(message, error);
    
    let userMessage = 'Ein Fehler ist aufgetreten';
    
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        userMessage = 'Keine Verbindung zum Server';
      } else if (error.status === 500) {
        userMessage = 'Interner Serverfehler';
      }
    }

    this.snackBar.open(userMessage, '', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      verticalPosition: 'bottom',
      horizontalPosition: 'center'
    });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      verticalPosition: 'bottom',
      horizontalPosition: 'center'
    });
  }
} 
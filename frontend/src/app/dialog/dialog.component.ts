import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface DialogData {
  title: string;
  message?: string;
  confirmText: string;
  cancelText: string;
  confirmClass?: string;
}

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="dialog-container">
      <h2 class="dialog-title">{{ data.title }}</h2>
      
      @if (data.message) {
        <p class="dialog-message">{{ data.message }}</p>
      }

      <div class="dialog-actions">
        <button class="button" (click)="onCancel()">
          {{ data.cancelText }}
        </button>
        <button class="button" 
          [class]="data.confirmClass || 'vonesco'"
          (click)="onConfirm()">
          {{ data.confirmText }}
        </button>
      </div>
    </div>
  `
})
export class DialogComponent {
  private dialogRef = inject(MatDialogRef<DialogComponent>);
  protected data = inject(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
} 
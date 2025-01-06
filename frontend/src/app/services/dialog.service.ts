import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent, DialogData } from '../dialog/dialog.component';
import { firstValueFrom } from 'rxjs';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmClass?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  async confirm(data: DialogData): Promise<boolean> {
    const dialogRef = this.dialog.open(DialogComponent, {
      data,
      width: '300px'
    });

    return await firstValueFrom(dialogRef.afterClosed()) || false;
  }

  async showConfirmDialog(data: ConfirmDialogData): Promise<boolean> {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: data.title,
        message: data.message,
        confirmText: data.confirmText || 'Bestätigen',
        cancelText: data.cancelText || 'Abbrechen',
        confirmClass: data.confirmClass
      },
      width: '400px'
    });

    return await firstValueFrom(dialogRef.afterClosed()) || false;
  }
}
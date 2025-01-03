import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent, DialogData } from '../dialog/dialog.component';
import { firstValueFrom } from 'rxjs';

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
}
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root'
})
export class EditStateService {
  private editMode = new BehaviorSubject<boolean>(false);
  private orderMode = new BehaviorSubject<boolean>(false);
  private hasChanges = false;

  constructor(private dialogService: DialogService) {}

  enableEdit = () => this.editMode.value;
  enableOrder = () => this.orderMode.value;

  startEdit(): void {
    this.editMode.next(true);
  }

  async cancelEdit(): Promise<void> {
    if (this.hasChanges) {
      const confirmed = await this.dialogService.confirm({
        title: 'Änderungen verwerfen?',
        message: 'Möchten Sie die Änderungen wirklich verwerfen?',
        confirmText: 'Ja',
        cancelText: 'Nein'
      });

      if (!confirmed) {
        return;
      }
    }

    this.editMode.next(false);
    this.orderMode.next(false);
    this.hasChanges = false;
  }

  finishEdit(): void {
    this.editMode.next(false);
    this.orderMode.next(false);
    this.hasChanges = false;
  }

  toggleOrder(): void {
    this.orderMode.next(!this.orderMode.value);
    this.hasChanges = true;
  }

  setHasChanges(value: boolean): void {
    this.hasChanges = value;
  }
} 
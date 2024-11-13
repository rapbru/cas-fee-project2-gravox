import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EditStateService {
  public enableEdit = signal<boolean>(false);

  toggleEdit() {
    this.enableEdit.set(!this.enableEdit());
  }
}
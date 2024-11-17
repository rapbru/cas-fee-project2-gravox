import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OverviewStateService {
  public enableEdit = signal<boolean>(false);
  public enableOrder = signal<boolean>(false);
  public enableMultiSelect = signal<boolean>(false);

  toggleEdit() {
    this.enableEdit.set(!this.enableEdit());
  }

  toggleOrder() {
    this.enableOrder.set(!this.enableOrder());
  }

  toggleMultiSelect() {
    this.enableMultiSelect.set(!this.enableMultiSelect());
  }

  resetState() {
    this.enableEdit.set(false);
    this.enableOrder.set(false);
    this.enableMultiSelect.set(false); 
  }

}
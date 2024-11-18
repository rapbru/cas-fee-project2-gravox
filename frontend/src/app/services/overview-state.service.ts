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
    if (!this.enableEdit()) {
      this.resetState();
    }
  }

  toggleOrder() {
    this.enableOrder.set(!this.enableOrder());
    if (this.enableOrder()){
      this.enableMultiSelect.set(false);
    }
  }

  toggleMultiSelect() {
    this.enableMultiSelect.set(!this.enableMultiSelect());
    if (this.enableMultiSelect()){
      this.enableOrder.set(false);
    }
  }

  resetState() {
    this.enableOrder.set(false);
    this.enableMultiSelect.set(false); 
  }

}
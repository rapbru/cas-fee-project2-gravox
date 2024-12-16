import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceDetectionService {
  public isMobileSignal = signal<boolean>(this.checkIfMobile());

  constructor() {
    window.addEventListener('resize', this.updateValues);
  }

  private checkIfMobile(): boolean {
    return window.matchMedia('(max-width: 600px)').matches;
  }

  private updateValues = () => {
    this.isMobileSignal.set(this.checkIfMobile());
  }

}
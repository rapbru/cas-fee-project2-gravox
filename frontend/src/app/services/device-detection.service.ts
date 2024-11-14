import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceDetectionService {
  public isMobileSignal = signal<boolean>(this.checkIfMobile());

  constructor() {
    window.addEventListener('resize', this.updateIsMobile);
  }

  private checkIfMobile(): boolean {
    return window.matchMedia('(max-width: 600px)').matches;
  }

  private updateIsMobile = () => {
    this.isMobileSignal.set(this.checkIfMobile());
  }
  
}
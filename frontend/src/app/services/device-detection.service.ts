import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceDetectionService {
  private readonly COLUMN_MIN_WIDTH = 500;
  public isMobileSignal = signal<boolean>(this.checkIfMobile());
  public maxColumnsSignal = signal<number>(this.calculateMaxColumns());

  constructor() {
    window.addEventListener('resize', this.updateValues);
  }

  private checkIfMobile(): boolean {
    return window.matchMedia('(max-width: 600px)').matches;
  }

  private calculateMaxColumns(): number {
    console.log('calculateMaxColumns', window.innerWidth / this.COLUMN_MIN_WIDTH);
    const maxCols = Math.floor(window.innerWidth / this.COLUMN_MIN_WIDTH);
    return Math.max(1, maxCols);
  }

  private updateValues = () => {
    this.isMobileSignal.set(this.checkIfMobile());
    this.maxColumnsSignal.set(this.calculateMaxColumns());
  }

  getMaxColumns(): number {
    return this.maxColumnsSignal();
  }
}
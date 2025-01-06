import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private titleSignal = signal<string>('');
  public title = this.titleSignal.asReadonly();

  setTitle(title: string) {
    this.titleSignal.set(title);
  }
} 
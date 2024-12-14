import { Injectable, Output, EventEmitter } from '@angular/core';
import { HostListener } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KeyEventService {

  @Output() keyPressed!: EventEmitter<KeyboardEvent>;

  constructor() {
    this.keyPressed = new EventEmitter<KeyboardEvent>();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    this.keyPressed.emit(event);
  }
}

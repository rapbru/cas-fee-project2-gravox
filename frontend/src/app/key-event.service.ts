import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HostListener } from '@angular/core';

interface KeyAction {
  key: string;
  action: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class KeyEventService {
  keyPressed = new Subject<KeyboardEvent>();
  private actions: KeyAction[] = [];

  constructor() {}

  registerKeyAction(key: string, action: () => void): void {
    this.actions.push({ key, action });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    this.keyPressed.next(event);

    const matchingAction = this.actions.find(action => action.key === event.key);
    if (matchingAction) {
      matchingAction.action();
    }
  }
}

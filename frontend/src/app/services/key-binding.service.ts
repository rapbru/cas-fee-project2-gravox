import { Injectable, OnDestroy } from '@angular/core';
import { OverviewStateService } from './overview-state.service';
import { fromEvent, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class KeyBindingService implements OnDestroy {
  private keySubscription: Subscription;

  constructor(private overviewStateService: OverviewStateService) {
    this.keySubscription = fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter(event => event.key === 'Escape')
      )
      .subscribe((event) => {
        const activeElement = document.activeElement;
        
        // If we're in an input field, blur it first
        if (activeElement instanceof HTMLInputElement || 
            activeElement instanceof HTMLTextAreaElement) {
          activeElement.blur();
        } 
        // Otherwise, toggle edit mode if it's enabled
        else if (this.overviewStateService.enableEdit()) {
          this.overviewStateService.toggleEdit();
        }
      });
  }

  ngOnDestroy() {
    if (this.keySubscription) {
      this.keySubscription.unsubscribe();
    }
  }
} 
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
        filter(event => event.key === 'Escape' || event.key === 'Enter')
      )
      .subscribe((event) => {
        const activeElement = document.activeElement;
        
        if (activeElement instanceof HTMLInputElement || 
            activeElement instanceof HTMLTextAreaElement) {
          
          if (event.key === 'Escape') {
            activeElement.blur();
          } else if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            activeElement.blur();
            
            const changeEvent = new Event('change', { bubbles: true });
            activeElement.dispatchEvent(changeEvent);
          }
        } 
        else if (event.key === 'Escape' && this.overviewStateService.enableEdit()) {
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
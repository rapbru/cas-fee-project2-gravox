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
      .subscribe(() => {
        if (this.overviewStateService.enableEdit()) {
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
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ScreenService implements OnDestroy {
  private isMobileSubject = new BehaviorSubject<boolean>(this.checkMobile());
  isMobile$ = this.isMobileSubject.asObservable();
  private resizeSubscription: Subscription;

  constructor() {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(
        debounceTime(200),
        startWith(null)
      )
      .subscribe(() => {
        this.isMobileSubject.next(this.checkMobile());
      });
  }

  private checkMobile(): boolean {
    return window.matchMedia('(max-width: 600px)').matches;
  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
  }
}

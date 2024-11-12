import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Position } from '../position.model';
import { catchError, map, Observable, of } from 'rxjs';
import { interval, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable({
  providedIn: 'root'
})
export class PositionService {
  // private apiUrl = 'http://localhost:3001/plc/read/';
  private apiUrl = 'http://localhost:3001/position/';
  public positions = signal<Position[]>([]);
  public orderedPositions = signal<Position[]>([]);
  private updateInterval = 1000;
  private intervalSubscription!: Subscription;

  constructor(private http: HttpClient, private snackbar: MatSnackBar) {
    // this.startFetching();
  }

  public startFetching() {
    this.intervalSubscription = interval(this.updateInterval).subscribe(() => {
      console.log(this.load());
    });
    // this.load();
  }

  public stopFetching() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  public load() {
    return this.http.get<Position[]>(this.apiUrl).pipe(
        catchError((error) => {
            this.snackbar.open('Could not load positions', 'Ok');
            console.error('Error loading positions:', error);
            return of([]);
        }),
        map(data => {
            console.log('API Response:', data);
            const transformedData = this.transformData(data);
            console.log('Transformed:', transformedData);
            return transformedData;
        })
    ).subscribe(loaded => {
        this.positions.set(loaded);
        this.applyOrder();
    });
}

  private applyOrder() {
    const currentPositions = this.positions();
    const ordered = this.orderedPositions();
  
    const newOrdered = ordered.length > 0 
    ? ordered.map(pos => currentPositions.find(p => p.number === pos.number)).filter((pos): pos is Position => pos !== undefined)
    : [...currentPositions]; 
    this.orderedPositions.set(newOrdered);
  }

  public updateOrderedPositions(newOrder: Position[]) {
    this.orderedPositions.set(newOrder);
  }

  private transformData(data: Position[]): Position[] {
    const transformedPositions: Position[] = data.map(position => ({
        number: position.number,
        name: position.name,
        flightbar: position.flightbar,
        articleName: position.articleName,
        customerName: position.customerName,
        time: {
            actual: parseFloat((position.time.actual / 60).toFixed(2)),
            preset: parseFloat((position.time.preset / 60).toFixed(2))
        },
        temperature: {
            actual: position.temperature.actual,
            preset: position.temperature.preset,
            isPresent: position.temperature.isPresent
        },
        current: {
            actual: position.current.actual,
            preset: position.current.preset,
            isPresent: position.current.isPresent
        },
        voltage: {
            actual: position.voltage.actual,
            preset: position.voltage.preset,
            isPresent: position.voltage.isPresent
        }
    }));

    return transformedPositions;
  }

  private mapPositionToTags(position: Position): { tagName: string, value: number }[] {
    const tags = [
        { tagName: `POS[${position.number}].TIME.PRESET`, value: position.time.preset * 60 },
        { tagName: `POS[${position.number}].TIME.ACTUAL`, value: position.time.actual * 60 },
        { tagName: `POS[${position.number}].TEMP.PRESET`, value: position.temperature.preset },
        { tagName: `POS[${position.number}].TEMP.ACTUAL1`, value: position.temperature.actual },
        { tagName: `POS[${position.number}].VOLT.PRESET`, value: position.voltage?.preset ?? 0 },
        { tagName: `POS[${position.number}].VOLT.ACTUAL`, value: position.voltage?.actual ?? 0 },
        { tagName: `POS[${position.number}].CURR.PRESET`, value: position.current?.preset ?? 0 },
        { tagName: `POS[${position.number}].CURR.ACTUAL`, value: position.current?.actual ?? 0 }
    ];

    return tags;
  }

  savePosition(position: Position): Observable<void> {
    const tagsToWrite = this.mapPositionToTags(position);
    return this.http.post<void>(this.apiUrl+'write', tagsToWrite).pipe(
      catchError(error => {
        this.snackbar.open('Failed to save position.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Error saving position:', error);
        return of();
      })
    );
  }

  showSuccessMessage() {
    this.snackbar.open('Position saved successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}

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
  private apiUrl = 'http://localhost:3001/plc/read/';
  public positions = signal<Position[]>([]);
  public orderedPositions = signal<Position[]>([]);
  private updateInterval = 1000;
  private intervalSubscription!: Subscription;

  constructor(private http: HttpClient, private snackbar: MatSnackBar) {
    // this.startFetching();
  }

  public startFetching() {
    this.intervalSubscription = interval(this.updateInterval).subscribe(() => {
      this.load();
    });
    // this.load();
  }

  public stopFetching() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  public load(){
    return this.http.get<{ tag: string, value: number }[]>(this.apiUrl).pipe(
      catchError((error) => {
        this.snackbar.open('Could not load positions', 'Ok');
        console.error('Error loading positions:', error);
        return of([]);
      }),
      map(data => this.transformData(data))
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

  private transformData(data: { tag: string, value: number }[]): Position[] {
    const positionsMap = new Map<number, Position>();

    data.forEach(item => {
      const indexMatch = item.tag.match(/POS\[(\d+)\]/);
      if (indexMatch) {
        const index = parseInt(indexMatch[1], 10);
        if (!positionsMap.has(index)) {
          positionsMap.set(index, {
            number: index,
            name: 'Positionsname', 
            flightbar: 0,
            articleName: '',
            customerName: '',
            time: { actual: 0, preset: 0 },
            temperature: { actual: 0, preset: 0 },
            current: { actual: 0, preset: 0 },
            voltage: { actual: 0, preset: 0 }
          });
        }

        const position = positionsMap.get(index) as Position;
        const field = this.mapTagToPosition(item.tag);

        if (field) {
          let value = 0;
          value = item.value;

          const [property, subProperty] = field.split('.');

          if (subProperty) {
            if (property === 'time') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (position as any)[property][subProperty] = (value / 60).toFixed(2);
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (position as any)[property][subProperty] = value;
            }
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (position as any)[field] = value;
          }
        }
      }
    });
    console.log('Transform done:', positionsMap);

    return Array.from(positionsMap.values());
  }

  private mapTagToPosition(tag: string): keyof Position | string | null {
    if (tag.includes('FB.NBR')) return 'flightbar';
    if (tag.includes('TIME.PRESET')) return 'time.preset';
    if (tag.includes('TIME.ACTUAL')) return 'time.actual';
    if (tag.includes('TEMP.PRESET')) return 'temperature.preset';
    if (tag.includes('TEMP.ACTUAL1')) return 'temperature.actual';
    if (tag.includes('VOLT.PRESET')) return 'voltage.preset';
    if (tag.includes('VOLT.ACTUAL')) return 'voltage.actual';
    if (tag.includes('CURR.PRESET')) return 'current.preset';
    if (tag.includes('CURR.ACTUAL')) return 'current.actual';
    return null;
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

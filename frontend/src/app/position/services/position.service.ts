import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Position } from '../position.model';
import { catchError, map, Observable, of } from 'rxjs';
import { interval, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private apiUrl = 'http://127.0.0.1:3001/plc/';
  public positions: Position[] = [];
  private updateInterval = 1000;
  private intervalSubscription!: Subscription;

  constructor(private http: HttpClient, private snackbar: MatSnackBar) {
    // this.startFetching();
  }

  public startFetching() {
    this.intervalSubscription = interval(this.updateInterval).subscribe(() => {
      this.load().subscribe(loaded => this.positions = loaded);
    });
  }

  public stopFetching() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  public load(): Observable<Position[]> {
    return this.http.get<{ tag: string, value: number }[]>(this.apiUrl).pipe(
      catchError((error) => {
        this.snackbar.open('Could not load positions', 'Ok');
        console.error('Error loading positions:', error);
        return of([]);
      }),
      map(data => this.transformData(data))
    );
  }

  private transformData(data: { tag: string, value: number }[]): Position[] {
    const positionsMap = new Map<number, Position>();

    data.forEach(item => {
      const indexMatch = item.tag.match(/POS\[(\d+)\]/);
      if (indexMatch) {
        const index = parseInt(indexMatch[1], 10);
        if (!positionsMap.has(index)) {
          positionsMap.set(index, {
            positionNumber: index,
            positionName: '',
            preTime: 0,
            actTime: 0,
            preTemperature: 0,
            actTemperature: 0,
            preVoltage: 0,
            actVoltage: 0,
            preCurrent: 0,
            actCurrent: 0,
            flightbarNumber: 0,
            articleName: ''
          });
        }

        const position = positionsMap.get(index) as Position;
        const field = this.mapTagToPosition(item.tag);

        if (field) {
          let value = 0;
          if ((field === 'preTime') || (field === 'actTime')) {
            value = item.value/60;
          } else {
            value = item.value;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (position as any)[field] = value;
        }
      }
    });
    console.log('Transform done:', positionsMap);

    return Array.from(positionsMap.values());
  }

  private mapTagToPosition(tag: string): keyof Position | null {
    // const mapping = {
    //   "FB.B.NBR": "flightbarNumber"
    // }



    if (tag.includes('FB.NBR')) return 'flightbarNumber';
    if (tag.includes('TIME.PRESET')) return 'preTime';
    if (tag.includes('TIME.ACTUAL')) return 'actTime';
    if (tag.includes('TEMP.PRESET')) return 'preTemperature';
    if (tag.includes('TEMP.ACTUAL1')) return 'actTemperature';
    return null;
  }

  private mapPositionToTags(position: Position): { tagName: string, value: number }[] {
    const tags = [
      { tagName: `POS[${position.positionNumber}].TIME.PRESET`, value: position.preTime * 60 }, // Assuming preTime is in minutes, converting to seconds
      { tagName: `POS[${position.positionNumber}].TIME.ACTUAL`, value: position.actTime * 60 },
      { tagName: `POS[${position.positionNumber}].TEMP.PRESET`, value: position.preTemperature },
      { tagName: `POS[${position.positionNumber}].TEMP.ACTUAL1`, value: position.actTemperature },
      // { tagName: `POS[${position.positionNumber}].VOLT.PRESET`, value: position.preVoltage },
      // { tagName: `POS[${position.positionNumber}].VOLT.ACTUAL`, value: position.actVoltage },
      // { tagName: `POS[${position.positionNumber}].CURR.PRESET`, value: position.preCurrent },
      // { tagName: `POS[${position.positionNumber}].CURR.ACTUAL`, value: position.actCurrent }
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

import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Position } from '../position/position.model';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { interval, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OverviewStateService } from './overview-state.service';


@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private apiUrl = 'http://localhost:3001/position/';
  public positions = signal<Position[]>([]);
  public orderedPositions = signal<Position[]>([]);
  private updateInterval = 1000;
  private intervalSubscription!: Subscription;
  private modifiedPositions = new Set<Position>();
  private originalPositions = new Map<number, Position>();

  constructor(
    private http: HttpClient, 
    private snackbar: MatSnackBar,
    private overviewStateService: OverviewStateService
  ) {}

  public startFetching() {
    this.intervalSubscription = interval(this.updateInterval).subscribe(() => {
      this.fetchPositions();
    });
  }

  public stopFetching() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  public load(): Observable<Position[]> {
    return this.http.get<Position[]>(this.apiUrl).pipe(
        catchError((error) => {
            this.snackbar.open('Could not load positions', 'Ok');
            console.error('Error loading positions:', error);
            return of([]);
        }),
        map(data => {
            const transformedData = this.transformData(data);
            return transformedData;
        })
    );
  }

  public fetchPositions() {
    this.load().subscribe(loaded => {
        const currentPositions = this.positions();
        // Im Edit-Modus behalte die aktuellen Änderungen bei
        if (this.overviewStateService.enableEdit()) {
            // Aktualisiere nur Positionen die nicht bearbeitet wurden
            const updatedPositions = currentPositions.map(pos => {
                const loadedPos = loaded.find(p => p.id === pos.id);
                return this.modifiedPositions.has(pos) ? pos : loadedPos || pos;
            });
            this.positions.set(updatedPositions);
        } else {
            this.positions.set(loaded);
        }
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
        id: position.id,
        number: position.number,
        name: position.name,
        flightbar: position.flightbar,
        articleName: position.articleName,
        customerName: position.customerName,
        time: {
            actual: parseFloat((position.time.actual).toFixed(2)),
            preset: parseFloat((position.time.preset).toFixed(2))
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

  showSuccessMessage() {
    this.snackbar.open('Position saved successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  addModifiedPosition(position: Position) {
    if (!this.originalPositions.has(position.id)) {
      this.originalPositions.set(position.id, {...position});
    }
    this.modifiedPositions.add(position);
  }

  saveChanges() {
    if (this.modifiedPositions.size === 0) return;

    const updates = Array.from(this.modifiedPositions).map(position => ({
      id: position.id,
      updates: {
        number: position.number,
        name: position.name,
        temperature: { isPresent: position.temperature.isPresent },
        current: { isPresent: position.current.isPresent },
        voltage: { isPresent: position.voltage.isPresent }
      }
    }));

    return this.http.patch(this.apiUrl, { updates }).pipe(
      tap(() => {
        this.showSuccessMessage();
        this.modifiedPositions.clear();
        this.originalPositions.clear();
      })
    ).subscribe();
  }

  cancelChanges() {
    const currentPositions = this.positions();
    const updatedPositions = currentPositions.map(pos => {
      const originalPos = this.originalPositions.get(pos.id);
      return originalPos && this.modifiedPositions.has(pos) ? originalPos : pos;
    });
    
    this.positions.set(updatedPositions);
    this.modifiedPositions.clear();
    this.originalPositions.clear();
  }

  createPosition(position: Position): Observable<Position> {
    return this.http.post<Position>(this.apiUrl, position).pipe(
      map(response => this.transformData([response])[0]),
      tap(newPosition => {
        const currentPositions = this.positions();
        this.positions.set([...currentPositions, newPosition]);
        
        const currentOrderedPositions = this.orderedPositions();
        this.orderedPositions.set([...currentOrderedPositions, newPosition]);
        
        this.showSuccessMessage();
      }),
      catchError(error => {
        this.snackbar.open('Failed to create position', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        throw error;
      })
    );
  }
}

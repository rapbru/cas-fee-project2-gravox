import { HttpClient } from '@angular/common/http';
import { computed, Injectable, Signal, signal } from '@angular/core';
import { Position } from '../models/position.model';
import { catchError, map, Observable, of, tap, forkJoin, switchMap } from 'rxjs';
import { interval, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OverviewStateService } from './overview-state.service';
import { ColumnManagementService } from './column-management.service';
import { ErrorHandlingService } from './error-handling.service';
import { PositionOrderService } from './position-order.service';
import { ApiConfigService } from '../services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private apiUrl: string;

  public positions = signal<Position[]>([]); // alle Positionen aus dem Backend
  public orderedPositions = signal<Position[]>([]); // Positionen geordnet nach der DB
  public editPositions = signal<Position[]>([]); // Positionen die bearbeitet werden
  public modifiedPositions = signal<Position[]>([]); // Positionen die geändert wurden
  public positionsToDelete = signal<Position[]>([]); // Positionen die gelöscht werden

  private updateInterval = 1000;
  private intervalSubscription!: Subscription;

  constructor(
    private http: HttpClient, 
    private snackbar: MatSnackBar,
    private overviewStateService: OverviewStateService,
    private columnManagementService: ColumnManagementService,
    private errorHandlingService: ErrorHandlingService,
    private positionOrderService: PositionOrderService,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.getUrl('position');
  }

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

  public fetchPositions() {
    this.http.get<Position[]>(this.apiUrl).pipe(
      map(positions => this.transformData(positions)),
      tap(loaded => this.positions.set(loaded)),
      switchMap(() => this.positionOrderService.applyOrder(this.positions())),
      tap(orderedPositions => {
        this.orderedPositions.set(orderedPositions);
      }),
      catchError(error => {
        console.error('Error fetching positions:', error);
        return of([]);
      })
    ).subscribe();
  }

  // Getter für die View
  public getPositions(): Signal<Position[]> {
    return computed(() => 
      this.overviewStateService.enableEdit() 
        ? this.editPositions() 
        : this.orderedPositions()
    );
  }

  public startEditing(): void {
    this.editPositions.set([...this.orderedPositions()]);
  }

  public cancelEditing(): void {
    this.editPositions.set([]);
  }

  private transformData(data: Position[]): Position[] {
    return data.map(position => ({
      id: position.id,
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
        actual: parseFloat(position.temperature.actual.toFixed(2)),
        preset: parseFloat(position.temperature.preset.toFixed(2)),
        isPresent: position.temperature.isPresent
      },
      current: {
        actual: parseFloat(position.current.actual.toFixed(2)),
        preset: parseFloat(position.current.preset.toFixed(2)),
        isPresent: position.current.isPresent
      },
      voltage: {
        actual: parseFloat(position.voltage.actual.toFixed(2)),
        preset: parseFloat(position.voltage.preset.toFixed(2)),
        isPresent: position.voltage.isPresent
      }
    }));
  }

  public createPosition(position: Position): Observable<Position> {
    return this.http.post<Position>(this.apiUrl, position).pipe(
      map(response => this.transformData([response])[0]),
      tap(() => {        
        this.errorHandlingService.showSuccess('Position erfolgreich erstellt');
      }),
      catchError(error => {
        this.errorHandlingService.showError('Fehler beim Erstellen der Position');
        throw error;
      })
    );
  }

  public saveAllChanges(): void {
    if (this.hasNewPositions()) {
        this.saveNewPositions().subscribe({
            next: () => {
                this.saveRemainingOperations();
            },
            error: (error) => {
                this.errorHandlingService.showError('Fehler beim Speichern der neuen Positionen', error);
            }
        });
    } else {
        this.saveRemainingOperations();
    }
    this.fetchPositions();
  }

  private saveNewPositions(): Observable<void> {
    return this.handleNewPositions().pipe(
        tap(newPositions => {
            // Update die temporären IDs mit den neuen DB-IDs
            const editPositions = this.editPositions();
            const updatedPositions = editPositions.map(pos => {
                const newPosition = newPositions.find(p => p.oldId === pos.id);
                return newPosition ? { ...pos, id: newPosition.id } : pos;
            });
            this.editPositions.set(updatedPositions);
        }),
        map(() => void 0)
    );
  }

  private handleNewPositions(): Observable<{id: number, oldId: number}[]> {
    const newPositions = this.editPositions().filter(pos => pos.id < 0);
    if (newPositions.length === 0) return of([]);

    return forkJoin(
        newPositions.map(pos => 
            this.http.post<Position>(`${this.apiUrl}`, pos).pipe(
                map(savedPos => ({
                    id: savedPos.id,
                    oldId: pos.id
                }))
            )
        )
    );
  }

  private hasNewPositions(): boolean {
    return this.editPositions().some(pos => pos.id < 0);
  }

  private saveRemainingOperations(): void {
    // Modifikationen
    if (this.hasModifications()) {
        this.handleModifiedPositions().forEach(observable => 
            observable.subscribe({
                error: (error) => this.errorHandlingService.showError('Fehler beim Aktualisieren der Positionen', error)
            })
        );
    }

    // Löschungen
    this.handleDeletedPositions().subscribe({
      error: (error) => this.errorHandlingService.showError('Fehler beim Löschen der Positionen', error)
    });

    // Spalteneinstellungen
    this.columnManagementService.saveColumnSettings().subscribe({
        error: (error) => this.errorHandlingService.showError('Fehler beim Speichern der Spalteneinstellungen', error)
    });

    // Positionsreihenfolge mit den aktualisierten IDs
    const editPositions = this.editPositions();
    this.positionOrderService.savePositionOrder(editPositions.map(pos => pos.id)).subscribe({
        next: () => {
            this.clearModifiedPositions();
            this.errorHandlingService.showSuccess('Alle Änderungen erfolgreich gespeichert');
        },
        error: (error) => this.errorHandlingService.showError('Fehler beim Speichern der Reihenfolge', error)
    });
  }

  private handleModifiedPositions(): Observable<Position | void>[] {
    const modifiedPositions = this.modifiedPositions()
        .filter(pos => !this.positionsToDelete().some(delPos => delPos.id === pos.id));
    
    const observables: Observable<Position | void>[] = [];
    const existingPositions = modifiedPositions.filter(pos => pos.id > 0);

    if (existingPositions.length > 0) {
      observables.push(this.updateExistingPositions(existingPositions));
    }

    return observables;
  }

  private updateExistingPositions(positions: Position[]): Observable<void> {
    return this.http.patch<void>(this.apiUrl, { 
      updates: positions.map(position => ({
        id: position.id,
        updates: {
          number: position.number,
          name: position.name,
          temperature: { isPresent: position.temperature.isPresent },
          current: { isPresent: position.current.isPresent },
          voltage: { isPresent: position.voltage.isPresent }
        }
      }))
    });
  }

  private handleDeletedPositions(): Observable<void> {
    const positionsToDelete = this.positionsToDelete();
    if (positionsToDelete.length === 0) return of(void 0);
    
    return this.http.delete<void>(this.apiUrl, {
        body: { positionIds: positionsToDelete.map(pos => pos.id) }
    }).pipe(
        tap(() => {
            const currentPositions = this.positions()
                .filter(p => !positionsToDelete.some(del => del.id === p.id));
            this.positions.set(currentPositions);
        })
    );
  }

  public clearModifiedPositions(): void {
    this.modifiedPositions.set([]);
    this.positionsToDelete.set([]);
  }

  public handleTemporaryPosition(position: Position): void {
    const currentEditPositions = this.editPositions();
    this.editPositions.set([...currentEditPositions, position]);

    const currentModifiedPositions = this.modifiedPositions();
    this.modifiedPositions.set([...currentModifiedPositions, position]);
    this.columnManagementService.addPositionToLastColumn();
  }

  public cancelAllChanges(): void {
    this.clearModifiedPositions();
    
    this.columnManagementService.resetToOriginal();
  }

  private hasModifications(): boolean {
    return this.modifiedPositions().length > 0;
  }

  public trackModification(position: Position): void {
   
    const currentModified = this.modifiedPositions();
    if (!currentModified.some(p => p.id === position.id)) {
      this.modifiedPositions.set([...currentModified, position]);
    }
  }

  public markPositionsForDeletion(): void {
    const selectedPositions = this.editPositions().filter(pos => pos.isSelected);
    const currentEditPositions = this.editPositions()
      .filter(pos => !selectedPositions.some(selected => selected.id === pos.id));
    selectedPositions.forEach(pos => {
      const positionIndex = this.columnManagementService.getPositionIndex(pos.number);
      if (positionIndex) {
        this.columnManagementService.updatePositionsPerColumn(positionIndex.columnIndex, -1);
      }
    });

    this.editPositions.set(currentEditPositions);
    this.positionsToDelete.set(selectedPositions);
  }

  public refreshPositions(): void {
    // Löst eine Neuberechnung aus, indem wir das Signal aktualisieren
    const currentPositions = this.editPositions();
    this.editPositions.set([...currentPositions]);
  }
}

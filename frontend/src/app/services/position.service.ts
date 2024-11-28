import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Position } from '../models/position.model';
import { catchError, map, Observable, of, tap, forkJoin } from 'rxjs';
import { interval, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OverviewStateService } from './overview-state.service';
import { ColumnSettings } from '../models/column-settings.model';
import { ColumnManagementService } from './column-management.service';
import { ErrorHandlingService } from './error-handling.service';
import { PositionOrderService } from './position-order.service';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private apiUrl = 'http://localhost:3001/position/';
  public positions = signal<Position[]>([]);
  public orderedPositions = signal<Position[]>([]);
  private updateInterval = 1000;
  private intervalSubscription!: Subscription;
  public modifiedPositions = signal<Position[]>([]);
  private originalPositions = new Map<number, Position>();
  private positionsToDelete = signal<Position[]>([]);

  constructor(
    private http: HttpClient, 
    private snackbar: MatSnackBar,
    private overviewStateService: OverviewStateService,
    private columnManagementService: ColumnManagementService,
    private errorHandlingService: ErrorHandlingService,
    private positionOrderService: PositionOrderService
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
      map(data => this.transformData(data))
    );
  }

  public fetchPositions() {
    this.http.get<Position[]>(this.apiUrl).pipe(
      map(positions => this.transformData(positions)),
      tap(loaded => {
        const currentPositions = this.positions();

        if (this.overviewStateService.enableEdit()) {

          const updatedPositions = currentPositions.map(pos => {
            const loadedPos = loaded.find(p => p.id === pos.id);
            if (loadedPos) {
              loadedPos.isSelected = pos.isSelected;
            }
            return this.modifiedPositions().some(p => p.id === pos.id) ? pos : loadedPos || pos;
          });
          this.positions.set(updatedPositions);
        } else {
          this.positions.set(loaded);
        }
        this.applyOrder();
      }),
      catchError(error => {
        console.error('Error fetching positions:', error);
        return of([]);
      })
    ).subscribe();
  }

  private applyOrder() {
    const currentPositions = this.positions();
    const ordered = this.orderedPositions();
    
    if (!this.overviewStateService.enableEdit()) {
        this.positionOrderService.applyOrder(currentPositions).subscribe({
            next: (orderedPositions) => {
                this.orderedPositions.set(orderedPositions);
            },
            error: (error) => {
                console.error('Error applying order:', error);
                this.orderedPositions.set(currentPositions);
            }
        });
    } else {
        const newOrdered = ordered.length > 0 
            ? ordered.map(pos => currentPositions.find(p => p.number === pos.number))
                .filter((pos): pos is Position => pos !== undefined)
            : [...currentPositions]; 
        this.orderedPositions.set(newOrdered);
    }
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


  }

  public createPosition(position: Position): Observable<Position> {
    return this.http.post<Position>(this.apiUrl, position).pipe(
      map(response => this.transformData([response])[0]),
      tap(newPosition => {
        const currentPositions = this.positions();
        this.positions.set([...currentPositions, newPosition]);
        
        const currentOrderedPositions = this.orderedPositions();
        this.orderedPositions.set([...currentOrderedPositions, newPosition]);
        
        this.errorHandlingService.showSuccess('Position erfolgreich erstellt');
      }),
      catchError(error => {
        this.errorHandlingService.showError('Fehler beim Erstellen der Position');
        throw error;
      })
    );
  }

  private collectSaveOperations(): Observable<Position | void | ColumnSettings>[] {
    const observables: Observable<Position | void | ColumnSettings>[] = [];
    
    this.addModificationOperations(observables);
    this.addDeletionOperations(observables);
    this.addColumnSettingsOperation(observables);
    this.addPositionOrderOperation(observables);
    
    return observables;
  }

  private addModificationOperations(observables: Observable<Position | void | ColumnSettings>[]): void {
    if (this.hasModifications()) {
      observables.push(...this.handleModifiedPositions());
    }
  }

  private addDeletionOperations(observables: Observable<Position | void | ColumnSettings>[]): void {
    const deleteObservables = this.handleDeletedPositions();
    if (deleteObservables.length > 0) {
      observables.push(...deleteObservables);
    }
  }

  private addColumnSettingsOperation(observables: Observable<Position | void | ColumnSettings>[]): void {
    observables.push(this.columnManagementService.saveColumnSettings());
  }

  private addPositionOrderOperation(observables: Observable<Position | void | ColumnSettings>[]): void {
    const orderedPositions = this.orderedPositions();
    if (orderedPositions.length > 0) {
      observables.push(
        this.positionOrderService.savePositionOrder(
          orderedPositions.map(pos => pos.id)
        )
      );
    }
  }

  public saveAllChanges(): void {
    const saveOperations = this.collectSaveOperations();
    
    if (saveOperations.length > 0) {
      this.executeSaveOperations(saveOperations);
    }
  }

  private handleModifiedPositions(): Observable<Position | void>[] {
    const modifiedPositions = this.modifiedPositions();
    const observables: Observable<Position | void>[] = [];
    
    const newPositions = modifiedPositions.filter(pos => pos.id < 0);
    const existingPositions = modifiedPositions.filter(pos => pos.id > 0);

    if (newPositions.length > 0) {
      observables.push(...newPositions.map(pos => this.createPosition(pos)));
    }

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

  private handleDeletedPositions(): Observable<void>[] {
    const positionsToDelete = this.positionsToDelete();
    if (positionsToDelete.length === 0) return [];
    
    return positionsToDelete.map(pos => 
        this.http.delete<void>(`${this.apiUrl}${pos.id}`).pipe(
            tap(() => {
                const currentPositions = this.positions()
                    .filter(p => p.id !== pos.id);
                this.positions.set(currentPositions);
            })
        )
    );
  }

  private executeSaveOperations(observables: Observable<Position | void | ColumnSettings>[]): void {
    forkJoin(observables).pipe(
      tap(() => {
        this.clearModifiedPositions();
        // const currentOrderedPositions = this.orderedPositions().filter(pos => pos.id !== 0);
        // this.orderedPositions.set(currentOrderedPositions);
        this.errorHandlingService.showSuccess('Alle Änderungen erfolgreich gespeichert');
      }),
      catchError(error => {
        console.error('Fehler beim Speichern:', error);
        this.errorHandlingService.showError('Fehler beim Speichern der Änderungen');
        throw error;
      })
    ).subscribe();
  }

  public clearModifiedPositions(): void {
    this.modifiedPositions.set([]);
    this.originalPositions.clear();
    this.positionsToDelete.set([]);
  }

  public handleTemporaryPosition(position: Position): void {
    // position.id = 0;
    
    const currentPositions = this.positions();
    this.positions.set([...currentPositions, position]);
    
    const currentModified = this.modifiedPositions();
    this.modifiedPositions.set([...currentModified, position]);
    
    this.orderedPositions.set([...this.orderedPositions(), position]);

    this.columnManagementService.addPositionToLastColumn();
  }

  public cancelAllChanges(): void {
    const currentPositions = this.positions().filter(pos => pos.id >= 0);
    this.positions.set(currentPositions);
    
    const updatedPositions = currentPositions.map(pos => {
      const original = this.originalPositions.get(pos.id);
      return original || pos;
    });
    
    this.positions.set(updatedPositions);
    this.clearModifiedPositions();
    
    this.columnManagementService.resetToOriginal();
  }

  private hasModifications(): boolean {
    return this.modifiedPositions().length > 0;
  }

  public trackModification(position: Position): void {
    if (!this.originalPositions.has(position.id)) {
      this.originalPositions.set(position.id, { ...position });
    }
    
    const currentModified = this.modifiedPositions();
    if (!currentModified.some(p => p.id === position.id)) {
      this.modifiedPositions.set([...currentModified, position]);
    }
  }

  public markPositionsForDeletion(): void {
    const selectedPositions = this.positions()
        .filter(pos => pos.isSelected);
    
    // Entferne die ausgewählten Positionen aus orderedPositions
    const currentOrderedPositions = this.orderedPositions()
        .filter(pos => !selectedPositions.some(selected => selected.id === pos.id));
    this.orderedPositions.set(currentOrderedPositions);
    
    // Markiere Positionen zum Löschen
    this.positionsToDelete.set(selectedPositions);
  }
}

import { Injectable } from '@angular/core';
import { ColumnSettings, ColumnSettingsDTO } from '../models/column-settings.model';
import { Position } from '../models/position.model';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlingService } from './error-handling.service';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ColumnManagementService {
  // Beispiel für die Aufteilung der Positionen
  // Angenommen wir haben:
  // columnCount = 3;
  // positionsPerColumn = [22, 22, 22];   // 3 Spalten mit je 22 Positionen
  // maxColumnCount = 2;                  // Aber Fenster erlaubt nur 2 Spalten

  // Dann wird columnDistribution so berechnet:
  // columnDistribution = [22, 44];       // Erste Spalte: 22, Zweite Spalte: 22+22=44
  private apiUrl = 'http://localhost:3001/settings/columns';
  private columnCount = 1;
  private maxColumnCount = 10;
  private positionsPerColumn: number[] = [];
  private originalSettings: ColumnSettings | null = null;
  private columnDistribution: number[] = [];

  constructor(
    private http: HttpClient,
    private errorHandlingService: ErrorHandlingService
  ) {}

  public loadColumnSettings(): Observable<ColumnSettings> {
    return this.http.get<ColumnSettingsDTO>(this.apiUrl).pipe(
      map((dto: ColumnSettingsDTO): ColumnSettings => {
        return {
          columnCount: dto.column_count,
          positionsPerColumn: dto.positions_per_column
        };
      }),
      tap((settings: ColumnSettings) => {
        this.applySettings(settings);
      }),
      catchError(error => {
        console.log('Error loading column settings:', error);
        const defaultSettings = this.getDefaultColumnSettings();
        this.applySettings(defaultSettings);
        return of(defaultSettings);
      })
    );
  }

  public increaseColumns(): void {
    this.saveOriginalSettings();
    this.columnCount++;
    this.positionsPerColumn.push(0);
    this.updateColumnDistribution();
  }

  public decreaseColumns(): void {
    if (this.columnCount <= 1) return;
    
    this.saveOriginalSettings();
    
    // Addiere die Positionen der letzten Spalte zur vorletzten Spalte
    const lastColumnPositions = this.positionsPerColumn[this.positionsPerColumn.length - 1];
    this.positionsPerColumn[this.positionsPerColumn.length - 2] += lastColumnPositions;
    
    // Entferne die letzte Spalte
    this.columnCount--;
    this.positionsPerColumn.pop();
    
    this.updateColumnDistribution();
  }

  public resetToOriginal(): void {
    if (this.originalSettings) {
      this.columnCount = this.originalSettings.columnCount;
      this.positionsPerColumn = [...this.originalSettings.positionsPerColumn];
      this.updateColumnDistribution();
      this.originalSettings = null;
    }
  }

  public splitPositionsDynamically(positions: Position[]): Position[][] {
    const columns: Position[][] = [];
    let currentIndex = 0;

    for (let i = 0; i < this.columnCount && i < this.maxColumnCount; i++) {
      const endIndex = this.columnDistribution[i];
      columns.push(positions.slice(currentIndex, endIndex));
      currentIndex = endIndex;
    }

    return columns;
  }

  private updateColumnDistribution(): void {   
    this.columnDistribution = this.positionsPerColumn.reduce((acc, curr, i) => {
      acc[i] = (acc[i-1] || 0) + curr;
      return acc;
    }, [] as number[]);
  }

  public getColumnCount(): number {
    return this.columnCount;
  }

  public getColumnDistribution(): number[] {
    return [...this.columnDistribution];
  }

  private applySettings(settings: ColumnSettings): void {
    this.columnCount = settings.columnCount;
    this.positionsPerColumn = [...settings.positionsPerColumn];
    this.originalSettings = { ...settings };
    this.updateColumnDistribution();
  }

  private getDefaultColumnSettings(): ColumnSettings {
    return {
      columnCount: 1,
      positionsPerColumn: [0]
    };
  }

  public saveColumnSettings(): Observable<ColumnSettings> {
    const settingsToSave = {
      columnCount: this.columnCount,
      positionsPerColumn: this.positionsPerColumn
    };
    
    return this.http.post<ColumnSettingsDTO>(this.apiUrl, settingsToSave).pipe(
      map(response => ({
        columnCount: response.column_count,
        positionsPerColumn: response.positions_per_column
      })),
      tap(savedSettings => {
        this.originalSettings = null;
        this.columnCount = savedSettings.columnCount;
        this.positionsPerColumn = savedSettings.positionsPerColumn;
        this.updateColumnDistribution();
      }),
      catchError(error => {
        this.errorHandlingService.showError('Fehler beim Speichern der Spalteneinstellungen');
        throw error;
      })
    );
  }

  public updatePositionsPerColumn(columnIndex: number, change: number): void {
    if (this.positionsPerColumn[columnIndex] !== undefined) {
      this.saveOriginalSettings();
      this.positionsPerColumn[columnIndex] += change;
      this.updateColumnDistribution();
    }
  }

  public removeColumn(columnIndex: number): void {
    if (columnIndex >= 0 && columnIndex < this.columnCount) {
      this.saveOriginalSettings();
      this.positionsPerColumn.splice(columnIndex, 1);
      this.columnCount--;
      this.updateColumnDistribution();
    }
  }

  public saveOriginalSettings(): void {
    if (!this.originalSettings) {
      this.originalSettings = {
        columnCount: this.columnCount,
        positionsPerColumn: [...this.positionsPerColumn]
      };
    }
  }

  public addPositionToLastColumn(): void {   
    this.saveOriginalSettings();
    this.positionsPerColumn[this.positionsPerColumn.length - 1]++;
    this.updateColumnDistribution();
  }
} 
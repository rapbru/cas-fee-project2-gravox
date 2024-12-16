import { Injectable, EventEmitter } from '@angular/core';
import { ColumnSettings, ColumnSettingsDTO } from '../models/column-settings.model';
import { Position } from '../models/position.model';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlingService } from './error-handling.service';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { PositionIndex } from '../models/position-index.model';
import { ApiConfigService } from '../services/api-config.service';
import { DeviceDetectionService } from './device-detection.service';

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
  private apiUrl: string;
  private columnCount = 1;
  private maxColumnCount = 10;
  private positionsPerColumn: number[] = [];
  private originalSettings: ColumnSettings | null = null;
  private columnDistribution: number[] = [];
  private positionIndices: PositionIndex[] = [];
  private readonly COLUMN_MIN_WIDTH = 500; // Minimale Breite pro Spalte in Pixeln
  public columnsChanged = new EventEmitter<void>();

  constructor(
    private http: HttpClient,
    private errorHandlingService: ErrorHandlingService,
    private deviceDetectionService: DeviceDetectionService,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.getUrl('settings/columns');
    
    // Reagiere auf Änderungen der maxColumns
    window.addEventListener('resize', () => {
      this.redistributeColumns();
    });
  }

  public loadColumnSettings(): Observable<ColumnSettings> {
    return this.http.get<ColumnSettingsDTO>(this.apiUrl).pipe(
      map((dto: ColumnSettingsDTO): ColumnSettings => {
        return {
          columnCount: dto.column_count,
          positionsPerColumn: dto.positions_per_column
        };
      }),
      tap((settings: ColumnSettings) => {
        this.originalSettings = { 
          columnCount: settings.columnCount,
          positionsPerColumn: [...settings.positionsPerColumn]
        };

        this.columnCount = settings.columnCount;
        this.positionsPerColumn = [...settings.positionsPerColumn];
        this.updateColumnDistribution();
        this.redistributeColumns();
      }),
      catchError(error => {
        console.log('Error loading column settings:', error);
        const defaultSettings = this.getDefaultColumnSettings();
        this.originalSettings = { ...defaultSettings };
        this.applySettings(defaultSettings);
        this.redistributeColumns(); 
        return of(defaultSettings);
      })
    );
  }

  public increaseColumns(): void {
    const maxCols = this.calculateMaxColumns();
    
    if (this.columnCount >= maxCols) {
      this.errorHandlingService.showError(
        `Maximale Spaltenanzahl (${maxCols}) erreicht. Bildschirm zu klein für weitere Spalten.`
      );
      return;
    }
    
    this.columnCount++;
    this.positionsPerColumn.push(0);
    this.updateColumnDistribution();
  }

  public decreaseColumns(): void {
    if (this.columnCount <= 1) return;
    
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
    }
    this.redistributeColumns();
  }

  public splitPositionsDynamically(positions: Position[]): Position[][] {
    const columns: Position[][] = Array.from({ length: this.columnCount }, () => []);
    let currentColumn = 0;
    
    // Reset position indices
    this.positionIndices = [];
    
    positions.forEach((position) => {
      if (currentColumn >= this.columnCount) {
        currentColumn = 0;
      }
      
      // Speichere die Position-Index-Information
      this.positionIndices.push({
        positionNumber: position.number,
        columnIndex: currentColumn,
        indexInColumn: columns[currentColumn].length
      });
      
      columns[currentColumn].push(position);
      
      if (columns[currentColumn].length >= this.positionsPerColumn[currentColumn]) {
        currentColumn++;
      }
    });
    return columns;
  }

  private updateColumnDistribution(): void {   
    this.columnDistribution = [...this.positionsPerColumn];
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
    this.updateColumnDistribution();
    this.redistributeColumns();
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
        this.originalSettings = { 
          columnCount: savedSettings.columnCount,
          positionsPerColumn: [...savedSettings.positionsPerColumn]
        };
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
      this.positionsPerColumn[columnIndex] += change;
      this.updateColumnDistribution();
    }

    console.log('Column Settings updated:', {
        columnCount: this.columnCount,
        positionsPerColumn: [...this.positionsPerColumn],
        columnDistribution: [...this.columnDistribution]
      });
  }

  public removeColumn(columnIndex: number): void {
    if (columnIndex >= 0 && columnIndex < this.columnCount) {
      this.positionsPerColumn.splice(columnIndex, 1);
      this.columnCount--;
      this.updateColumnDistribution();
    }
  }

  public addPositionToLastColumn(): void {   
    this.positionsPerColumn[this.positionsPerColumn.length - 1]++;
    this.updateColumnDistribution();
  }

  public getPositionIndex(positionNumber: number): PositionIndex | undefined {
    return this.positionIndices.find(index => index.positionNumber === positionNumber);
  }

  public getAllPositionIndices(): PositionIndex[] {
    return [...this.positionIndices];
  }

  private calculateMaxColumns(): number {
    const screenWidth = window.innerWidth;
    return Math.floor(screenWidth / this.COLUMN_MIN_WIDTH);
  }

  private redistributeColumns() {
    console.log('redistributeColumns');
    const maxCols = this.deviceDetectionService.getMaxColumns();
    
    this.columnCount = this.originalSettings?.columnCount || 1;
    this.positionsPerColumn = this.originalSettings?.positionsPerColumn || [0];
    
    if (this.columnCount > maxCols) {
      const excessColumns = this.columnCount - maxCols;
      let lastColumnPositions = this.positionsPerColumn[maxCols - 1];
      
      for (let i = 0; i < excessColumns; i++) {
        lastColumnPositions += this.positionsPerColumn[maxCols + i];
      }
      
      this.positionsPerColumn = this.positionsPerColumn.slice(0, maxCols);
      this.positionsPerColumn[maxCols - 1] = lastColumnPositions;
      this.columnCount = maxCols;
    } 

    this.updateColumnDistribution();
    this.columnsChanged.emit();
  }

} 
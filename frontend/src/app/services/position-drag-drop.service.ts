import { Injectable } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Position } from '../models/position.model';
import { PositionService } from './position.service';
import { ColumnManagementService } from './column-management.service';

@Injectable({
  providedIn: 'root'
})
export class PositionDragDropService {
  constructor(
    private positionService: PositionService,
    private columnManagementService: ColumnManagementService
  ) {}

  handleDrop(event: CdkDragDrop<Position[]>, columns: Position[][], columnIndex: number) {
    let movedBetween = false;
    const prevColumnIndex = columns.findIndex(col => col === event.previousContainer.data);

    if (event.previousContainer === event.container) {
      // Position innerhalb der gleichen Spalte verschoben
      const columnPositions = [...event.container.data];
      moveItemInArray(columnPositions, event.previousIndex, event.currentIndex);
      columns[columnIndex] = columnPositions;
    } else {
      // Position zwischen Spalten verschoben
      movedBetween = true;
      const prevColumn = [...columns[prevColumnIndex]];
      const newColumn = [...event.container.data];
      
      transferArrayItem(
        prevColumn,
        newColumn,
        event.previousIndex,
        event.currentIndex
      );
      
      columns[prevColumnIndex] = prevColumn;
      columns[columnIndex] = newColumn;
    }

    // Berechne die neue Gesamtreihenfolge der Positionen
    const newOrderedPositions = columns.reduce((acc, column) => {
      return acc.concat(column);
    }, [] as Position[]);

    // Aktualisiere die Spalteninformationen nur wenn zwischen Spalten verschoben wurde
    if (movedBetween) {
      if (columnIndex !== prevColumnIndex) {
        this.columnManagementService.updatePositionsPerColumn(prevColumnIndex, -1);
        this.columnManagementService.updatePositionsPerColumn(columnIndex, 1);
      }
      // Prüfe ob die vorherige Spalte leer ist und entfernt werden soll
      if (columns[prevColumnIndex].length <= 0) {
        this.columnManagementService.removeColumn(prevColumnIndex);
      }
    }

    // Aktualisiere die geordneten Positionen im PositionService
    this.positionService.orderedPositions.set(newOrderedPositions);
  }
} 


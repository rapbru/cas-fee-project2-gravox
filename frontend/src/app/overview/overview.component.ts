import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Position } from '../position/position.model';
import { PositionService } from '../position/services/position.service';
import { CommonModule } from '@angular/common';
import { PositionComponent } from './position.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem  } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
// import { PositionEditComponent } from '../position/position-edit/position-edit.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  // imports: [CommonModule, PositionComponent, PositionEditComponent],
  imports: [CommonModule, PositionComponent, DragDropModule, MatIconModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnDestroy, OnInit {
  // positions: Position[] = [];
  // selectedPosition: Position | undefined;
  private positionService = inject(PositionService);
  public enableEdit = signal<boolean>(false);
  private columnCount = 3;
  private positionsPerColumn = [25, 21, 5];
  private columnDistribution: number[] = [];

  ngOnInit() {
    this.positionService.startFetching();
    window.addEventListener('resize', this.updateColumnDistribution.bind(this));
  }
  
  columns = computed(() => {
    const initialColumns = this.positionService.orderedPositions(); 
    this.updateColumnDistribution();
    return this.splitPositionsDynamically(initialColumns, this.columnDistribution);
  });

  private updateColumnDistribution() {
    const windowWidth = window.innerWidth;
    let maxColumnCount: number;
    if (windowWidth >= 1200) {
      maxColumnCount = 5;
    } else if (windowWidth >= 800) {
      maxColumnCount = 2;
    } else {
      maxColumnCount = 1;
    }

    const distribution = []; 
    for (let i = 0; i < this.columnCount; i++) {
      if (i < maxColumnCount) {
        distribution[i] = this.positionsPerColumn[i];
      } else {
          distribution[maxColumnCount - 1] += this.positionsPerColumn[i];
      }
    }

    this.columnDistribution = distribution;
  }

  private splitPositionsDynamically(positions: Position[], distribution: number[]): Position[][] {
    const columns: Position[][] = [];
    let startIndex = 0;

    for (const count of distribution) {
      const column = positions.slice(startIndex, startIndex + count);
      columns.push(column);
      startIndex += count;
    }
    
    return columns;
  }

  positions = computed(() => {
    return this.positionService.orderedPositions();  
  });

  drop(event: CdkDragDrop<Position[]>, columnIndex: number) {
    let movedBetween = false;
    
    let previousColumnIndex = 0;

    const previousContainer = event.previousContainer;
    if (previousContainer) {
      const previousData = previousContainer.data as Position[];
      previousColumnIndex = this.columns().findIndex(column => column === previousData);
    }
    console.log(previousColumnIndex);

    if (event.previousContainer === event.container) {
      // Wenn das Element innerhalb der Liste verschoben wird
      moveItemInArray(this.columns()[columnIndex], event.previousIndex, event.currentIndex);
    } else {
      // Wenn das Element zwischen den Listen verschoben wird
      movedBetween = true;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    const newOrderedPositions = this.columns().reduce((acc, column) => {
      return acc.concat(column);
    }, [] as Position[]);

    if (movedBetween) {
      if (columnIndex !== previousColumnIndex) {
        this.positionsPerColumn[previousColumnIndex] -= 1;
        this.positionsPerColumn[columnIndex] += 1;
      }
      if (this.positionsPerColumn[previousColumnIndex] <= 0) {
        this.removeColumn(previousColumnIndex);
      }
    }

    this.positionService.updateOrderedPositions(newOrderedPositions);
  }

  private removeColumn(index: number) {
    this.columnDistribution.splice(index, 1);
    this.positionsPerColumn.splice(index, 1);
    this.columnCount = this.columnDistribution.length;
  }

  public increaseColumns() {
    this.columnCount++;
    this.positionsPerColumn.push(0);
    this.updateColumnDistribution();
  } 

  public decreaseColumns() {
    if (this.columnCount > 1) {
      const lastColumnIndex = this.columnCount - 1;
      this.positionsPerColumn[lastColumnIndex - 1] += this.positionsPerColumn[lastColumnIndex];
      this.positionsPerColumn[lastColumnIndex] = 0;
      this.columnCount--;
      this.updateColumnDistribution();
    }
  }

  toggleEdit() {
    this.enableEdit.set(!this.enableEdit());
  }

  // selectPosition(position: Position) {
  //   this.selectedPosition = position;
  // }

  // closeEdit() {
  //   this.selectedPosition = undefined;
  // }

  ngOnDestroy() {
    this.positionService.stopFetching();
  }
  
  // getPositionHeight(position: Position): string {
  //   if (position.flightbar) {
  //     return '250px';
  //   } else {
  //     return '150px';
  //   }
  // }

}

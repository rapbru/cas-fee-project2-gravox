import { Component, computed, OnDestroy, OnInit } from '@angular/core';
import { Position } from '../position/position.model';
import { PositionService } from '../services/position.service';
import { CommonModule } from '@angular/common';
import { PositionComponent } from '../position/position.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem  } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { OverviewStateService } from '../services/overview-state.service';
import { AddPositionComponent } from '../position/add-position/add-position.component';
import { DeviceDetectionService } from '../services/device-detection.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, PositionComponent, DragDropModule, MatIconModule, AddPositionComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnDestroy, OnInit {
  private columnCount = 1;
  private maxColumnCount = 0;
  private positionsPerColumn = [22];
  private columnDistribution: number[] = [];
  public newPosition: Position | null = null;

  constructor(private positionService: PositionService, private router: Router, private deviceDetectionService: DeviceDetectionService, public overviewStateService: OverviewStateService) {} 

  ngOnInit() {
    this.positionService.startFetching();
    window.addEventListener('resize', this.updateColumnDistribution.bind(this));
  }

  columns = computed(() => {
    const positions = this.positionService.orderedPositions();
    this.updateColumnDistribution();
    return this.splitPositionsDynamically(positions, this.columnDistribution);
  });

  private updateColumnDistribution() {
    const windowWidth = window.innerWidth;

    this.maxColumnCount = Math.min(Math.floor(windowWidth / 450), 10);
    if (this.maxColumnCount === 0) this.maxColumnCount = 1;

    const distribution = [];
    for (let i = 0; i < this.columnCount; i++) {
      if (i < this.maxColumnCount) {
        distribution[i] = this.positionsPerColumn[i];
      } else {
          distribution[this.maxColumnCount - 1] += this.positionsPerColumn[i];
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
    if (this.columnCount < this.maxColumnCount) {
      this.columnCount++;
      this.positionsPerColumn.push(0);
      this.updateColumnDistribution();
    }
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

  public ngOnDestroy() {
    this.positionService.stopFetching();
  }

  public navigateToArticles() {
    this.router.navigate(['/articles']).then(success => {
      if (success) {
        console.log('Navigation successful!');
      } else {
        console.error('Navigation failed!');
      }
    }).catch(err => {
      console.error('Error during navigation:', err);
    });
  }

  public addPosition() {
    const newPosition: Position = {
      id: 0,
      number: 0,
      name: '',
      flightbar: undefined,
      articleName: '',
      customerName: '',
      time: { actual: 0, preset: 0 },
      temperature: { actual: 0, preset: 0, isPresent: false },
      current: { actual: 0, preset: 0, isPresent: false },
      voltage: { actual: 0, preset: 0, isPresent: false }
    };
    this.newPosition = newPosition;
  }

  public savePosition(position: Position) {
    console.log(position);
    this.newPosition = null;
  }

  public closeAddPosition() {
    this.newPosition = null;
  }

  public orderPositions() {
    this.overviewStateService.toggleOrder();  
  }

  public deletePositions() {
    this.overviewStateService.toggleMultiSelect();
  }

  public saveChanges() {
    this.positionService.saveChanges();
    this.overviewStateService.resetState();
  }

  public cancelChanges() {
    this.positionService.cancelChanges();
    this.overviewStateService.resetState();
  }

  isMobile(): boolean {
    return this.deviceDetectionService.isMobileSignal();
  }

  enableEdit(): boolean {
    return this.overviewStateService.enableEdit();
  }

  enableOrder(): boolean {
    return this.overviewStateService.enableOrder();
  }

  enableMultiSelect(): boolean {
    return this.overviewStateService.enableMultiSelect();
  }

}

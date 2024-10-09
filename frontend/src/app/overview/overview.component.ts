import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Position } from '../position/position.model';
import { PositionService } from '../position/services/position.service';
import { CommonModule } from '@angular/common';
import { PositionComponent } from './position.component';
import { CdkDragDrop, DragDropModule, moveItemInArray  } from '@angular/cdk/drag-drop';
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
  public enableEdit = signal<boolean>(false);;
  private firstHalfLength = 25;

  ngOnInit() {
    this.positionService.startFetching();
  }

  positions = computed(() => {
    return this.positionService.orderedPositions();  
  });

  halfLength = computed(() => {
    return Math.ceil(this.positionService.orderedPositions().length / 2);
  });

  firstHalf = computed(() => {
    return this.positions().slice(0, this.firstHalfLength);
  });

  secondHalf = computed(() => {
    return this.positions().slice(this.firstHalfLength);
  });

  drop(event: CdkDragDrop<Position[]>, list: 'firstHalf' | 'secondHalf') {
    let movedBetween = false;
    if (event.previousContainer === event.container) {
      // Wenn das Element innerhalb der Liste verschoben wird
      moveItemInArray(list === 'firstHalf' ? this.firstHalf() : this.secondHalf(), event.previousIndex, event.currentIndex);
    } else {
      // Wenn das Element zwischen den Listen verschoben wird
      movedBetween = true;
      const movedItem = list === 'firstHalf' ? this.secondHalf()[event.previousIndex] : this.firstHalf()[event.previousIndex];
      if (list === 'firstHalf') {
        this.secondHalf().splice(event.previousIndex, 1);
        this.firstHalf().splice(event.currentIndex, 0, movedItem);
      } else {
        this.firstHalf().splice(event.previousIndex, 1);
        this.secondHalf().splice(event.currentIndex, 0, movedItem);
      }
    }
    
    const newOrderedPositions = [...this.firstHalf(), ...this.secondHalf()];
    this.positionService.updateOrderedPositions(newOrderedPositions);

    if (movedBetween) {
      if (list === 'firstHalf') {
        this.firstHalfLength = this.firstHalfLength + 1;
      } else {
        this.firstHalfLength = this.firstHalfLength - 1;
      }
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

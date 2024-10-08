import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { Position } from '../position/position.model';
import { PositionService } from '../position/services/position.service';
import { CommonModule } from '@angular/common';
import { PositionComponent } from './position.component';
// import { PositionEditComponent } from '../position/position-edit/position-edit.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  // imports: [CommonModule, PositionComponent, PositionEditComponent],
  imports: [CommonModule, PositionComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnDestroy, OnInit {
  positions: Position[] = [];
  selectedPosition: Position | undefined;
  positionService = inject(PositionService);

  // constructor(private positionService: PositionService) {
  //   this.loadPositions();
  // }

  ngOnInit() {
    this.positionService.startFetching();
  }

  // loadPositions() {
  //   this.positionService.load().subscribe(positions => {
  //     this.positions = positions;
  //     this.halfLength = Math.ceil(this.positions.length / 2);
  //   });
  // }

  halfLength = computed(() => {
    return Math.ceil(this.positionService.positions().length / 2) 
  })


  firstHalf = computed(() => {
    return this.positionService.positions().slice(0, this.halfLength());
  })


  secondHalf = computed(() => {
    return this.positionService.positions().slice(this.halfLength());
  })


  selectPosition(position: Position) {
    this.selectedPosition = position;
  }

  closeEdit() {
    this.selectedPosition = undefined;
  }

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

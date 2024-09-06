import { Component, OnDestroy, OnInit } from '@angular/core';
import { Position } from '../position/position.model';
import { PositionService } from '../position/services/position.service';
import { PositionComponent } from "../position/position.component";
import { CommonModule } from '@angular/common';
import { PositionEditComponent } from '../position/position-edit/position-edit.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, PositionComponent, PositionEditComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnDestroy, OnInit {
  positions: Position[] = [];
  selectedPosition: Position | undefined;

  constructor(private positionService: PositionService) {
    this.loadPositions();
  }

  ngOnInit() {
    this.positionService.startFetching();
  }

  loadPositions() {
    this.positionService.load().subscribe(positions => this.positions = positions);
  }

  selectPosition(position: Position) {
    this.selectedPosition = position;
  }

  closeEdit() {
    this.selectedPosition = undefined;
  }

  ngOnDestroy() {
    this.positionService.stopFetching();
  }
}

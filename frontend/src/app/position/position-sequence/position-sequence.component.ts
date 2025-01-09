import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Position } from '../../models/position.model';
import { PositionService } from '../../services/position.service';
import { LoggerService } from '../../services/logger.service';
import { SidebarSheetComponent } from '../../sidebar-sheet/sidebar-sheet.component';

@Component({
  selector: 'app-position-sequence',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    SidebarSheetComponent
  ],
  templateUrl: './position-sequence.component.html',
  styleUrls: ['./position-sequence.component.scss']
})
export class PositionSequenceComponent {
  selectedPositions: Position[] = [];
  showPositionSelector: boolean = false;

  constructor(
    public positionService: PositionService,
    private logger: LoggerService
  ) {}

  ngOnInit() {
    this.logger.log('PositionSequenceComponent initialized');
    this.positionService.startFetching();
  }

  ngOnDestroy() {
    this.positionService.stopFetching();
  }

  onAddPosition(position: Position) {
    if (!this.selectedPositions.includes(position)) {
      this.selectedPositions.push(position);
      this.logger.log('Position added to sequence:', position);
    }
  }

  onRemovePosition(position: Position) {
    const index = this.selectedPositions.indexOf(position);
    if (index > -1) {
      this.selectedPositions.splice(index, 1);
      this.logger.log('Position removed from sequence:', position);
    }
  }

  isPositionSelected(position: Position): boolean {
    return this.selectedPositions.includes(position);
  }
}

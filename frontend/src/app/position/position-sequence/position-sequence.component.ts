import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheetModule, MatBottomSheet } from '@angular/material/bottom-sheet';
import { Position } from '../../models/position.model';
import { PositionService } from '../../services/position.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-position-sequence',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatBottomSheetModule
  ],
  templateUrl: './position-sequence.component.html',
  styleUrls: ['./position-sequence.component.scss']
})
export class PositionSequenceComponent implements OnInit {
  selectedPositions: Position[] = [];
  isMobile: boolean = window.innerWidth < 768;
  showPositionSelector: boolean = false;
  enableTransitions: boolean = false;

  constructor(
    public positionService: PositionService,
    private logger: LoggerService,
    private bottomSheet: MatBottomSheet
  ) {}

  ngOnInit() {
    this.logger.log('PositionSequenceComponent initialized');
    this.positionService.startFetching();
    this.checkScreenSize();
    
    // Enable transitions after a short delay
    setTimeout(() => {
      this.enableTransitions = true;
    }, 100);
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;
    
    if (wasMobile !== this.isMobile && this.showPositionSelector) {
      this.showPositionSelector = false;
    }
  }

  ngOnDestroy() {
    this.positionService.stopFetching();
  }

  togglePositionSelector() {
    this.showPositionSelector = !this.showPositionSelector;
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

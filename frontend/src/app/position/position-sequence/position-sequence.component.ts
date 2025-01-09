import { Component, ViewChild, ElementRef, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CdkDragDrop, DragDropModule, CdkDrag, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { Position } from '../../models/position.model';
import { PositionService } from '../../services/position.service';
import { LoggerService } from '../../services/logger.service';
import { SidebarSheetComponent } from '../../sidebar-sheet/sidebar-sheet.component';
import { PositionDragDropService } from '../../services/position-drag-drop.service';

@Component({
  selector: 'app-position-sequence',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    SidebarSheetComponent,
    DragDropModule,
    CdkDrag,
    CdkDragHandle,
    CdkDropList
  ],
  templateUrl: './position-sequence.component.html',
  styleUrls: ['./position-sequence.component.scss']
})
export class PositionSequenceComponent {
  @ViewChild('selectedPositionsContainer') selectedPositionsContainer?: ElementRef;
  @HostBinding('class.show-sheet') get showSheetClass() { return this.showPositionSelector; }
  
  selectedPositions: Position[] = [];
  showPositionSelector: boolean = false;

  constructor(
    public positionService: PositionService,
    private logger: LoggerService,
    private positionDragDropService: PositionDragDropService
  ) {}

  ngOnInit() {
    this.logger.log('PositionSequenceComponent initialized');
    this.positionService.startFetching();
  }

  ngOnDestroy() {
    this.positionService.stopFetching();
  }

  onAddPosition(position: Position, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    this.selectedPositions = [...this.selectedPositions, position];
    this.logger.log('Position added to sequence:', position);

    // Scroll to the newly added position
    setTimeout(() => {
      if (this.selectedPositionsContainer) {
        const container = this.selectedPositionsContainer.nativeElement;
        const lastPosition = container.querySelector('.position-card:last-child');
        if (lastPosition) {
          const isMobile = window.innerWidth < 768;
          const viewportHeight = window.innerHeight;
          
          // Calculate optimal scroll position based on viewport height
          const scrollOptions = {
            behavior: 'smooth' as ScrollBehavior,
            block: isMobile ? 'start' : 
                   viewportHeight < 700 ? 'start' : 
                   'center'
          };
          
          lastPosition.scrollIntoView(scrollOptions);
        }
      }
    });
  }

  onRemovePosition(position: Position) {
    this.selectedPositions = this.selectedPositions.filter(p => p !== position);
    this.logger.log('Position removed from sequence:', position);
  }

  onCloseSheet() {
    this.showPositionSelector = false;
  }

  onDrop(event: CdkDragDrop<Position[]>) {
    const columns = [this.selectedPositions];
    this.positionDragDropService.handleDrop(event, columns, 0);
    this.selectedPositions = columns[0];
  }
}

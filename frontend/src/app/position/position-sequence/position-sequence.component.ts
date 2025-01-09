import { Component, ViewChild, ElementRef, HostBinding, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CdkDragDrop, DragDropModule, CdkDrag, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { Position } from '../../models/position.model';
import { PositionService } from '../../services/position.service';
import { LoggerService } from '../../services/logger.service';
import { SidebarSheetComponent } from '../../sidebar-sheet/sidebar-sheet.component';
import { PositionDragDropService } from '../../services/position-drag-drop.service';
import { ToolbarComponent } from '../../toolbar/toolbar.component';

@Component({
  selector: 'app-position-sequence',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    SidebarSheetComponent,
    DragDropModule,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    ToolbarComponent
  ],
  templateUrl: './position-sequence.component.html',
  styleUrls: ['./position-sequence.component.scss']
})
export class PositionSequenceComponent {
  @ViewChild('selectedPositionsContainer') selectedPositionsContainer?: ElementRef;
  @HostBinding('class.show-sheet') get showSheetClass() { return this.showPositionSelector; }
  
  selectedPositions: Position[] = [];
  showPositionSelector: boolean = false;
  @Output() selectedPositionsChange = new EventEmitter<Position[]>();

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

  toggleSelection(position: Position) {
    position.isSelected = !position.isSelected;
    this.positionService.trackModification(position);
  }

  onDrop(event: CdkDragDrop<Position[]>) {
    const columns = [this.selectedPositions];
    this.positionDragDropService.handleDrop(event, columns, 0);
    this.selectedPositions = columns[0];
  }

  hasSelectedPositions(): boolean {
    return this.selectedPositions.some(position => position.isSelected);
  }

  deleteSelectedPositions() {
    if (!this.hasSelectedPositions()) return;
    this.selectedPositions = this.selectedPositions.filter(position => !position.isSelected);
    this.selectedPositionsChange.emit(this.selectedPositions);
  }

  openPositionSelector() {
    this.showPositionSelector = true;
  }
}

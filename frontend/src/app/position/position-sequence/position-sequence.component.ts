import { Component, ViewChild, ElementRef, HostBinding, EventEmitter, Output, Input } from '@angular/core';
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
import { Sequence } from '../../models/sequence.model';
import { OverviewStateService } from '../../services/overview-state.service';

type PresetField = 'timePreset' | 'currentPreset' | 'voltagePreset';

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
  
  @Input() selectedPositions: Position[] = [];
  @Output() selectedPositionsChange = new EventEmitter<Sequence[]>();
  showPositionSelector: boolean = false;
  private editingState: { position: Position | null, field: PresetField | null } = { position: null, field: null };

  public readonly enableEdit = this.overviewStateService.enableEdit;

  constructor(
    public positionService: PositionService,
    private logger: LoggerService,
    private positionDragDropService: PositionDragDropService,
    private overviewStateService: OverviewStateService
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
    
    const enrichedPosition: Position = {
      ...position,
      timePreset: 0,
      currentPreset: 0,
      voltagePreset: 0
    };
    
    this.selectedPositions = [...this.selectedPositions, enrichedPosition];
    this.selectedPositionsChange.emit(this.createSequenceArray());

    this.logger.log('Position added to sequence:', enrichedPosition);

    setTimeout(() => {
      if (this.selectedPositionsContainer) {
        const container = this.selectedPositionsContainer.nativeElement;
        const lastPosition = container.querySelector('.position-card:last-child');
        if (lastPosition) {
          const isMobile = window.innerWidth < 768;
          const viewportHeight = window.innerHeight;
          
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
    this.selectedPositionsChange.emit(this.createSequenceArray());
    
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
    this.selectedPositionsChange.emit(this.createSequenceArray());
  }

  hasSelectedPositions(): boolean {
    return this.selectedPositions.some(position => position.isSelected);
  }

  deleteSelectedPositions() {
    if (!this.hasSelectedPositions()) return;
    this.selectedPositions = this.selectedPositions.filter(position => !position.isSelected);
    this.selectedPositionsChange.emit(this.createSequenceArray());
  }

  openPositionSelector() {
    this.showPositionSelector = true;
  }

  isEditing(position: Position, field: PresetField): boolean {
    return this.editingState.position === position && this.editingState.field === field;
  }

  startEditing(position: Position, field: PresetField): void {
    this.editingState = { position, field };
    requestAnimationFrame(() => {
      const inputs = document.getElementsByClassName('value-input');
      if (inputs.length > 0) {
        const input = inputs[0] as HTMLInputElement;
        input.focus();
        input.select();
      }
    });
  }

  cancelEdit(): void {
    this.editingState = { position: null, field: null };
  }

  formatNumber(value: number | undefined): string {
    if (value === undefined) return '0.00';
    return value.toFixed(2);
  }

  validateInput(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const selectionStart = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || 0;
    const key = event.key;

    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
      return;
    }

    if (!/^\d$/.test(key) && key !== '.') {
      event.preventDefault();
      return;
    }

    const newValue = value.slice(0, selectionStart) + key + value.slice(selectionEnd);

    if (key === '.') {
      if (value.includes('.')) {
        event.preventDefault();
        return;
      }
      return;
    }

    const parts = newValue.split('.');
    
    if (parts[0].length > 3) {
      event.preventDefault();
      return;
    }

    if (parts[1] && parts[1].length > 2) {
      event.preventDefault();
      return;
    }

    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue > 999.99) {
      event.preventDefault();
      return;
    }
  }

  confirmEdit(position: Position, field: PresetField, value: string): void {
    if (!this.isEditing(position, field)) return;
    
    let numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 999.99) {
      position[field] = Math.round(numValue * 100) / 100;
      this.selectedPositionsChange.emit(this.createSequenceArray());
    }
    
    this.cancelEdit();
  }

  private createSequenceArray(): Sequence[] {
    return this.selectedPositions.map((pos, index) => ({
      positionId: pos.id.toString(),
      orderNumber: index + 1,
      timePreset: pos.timePreset ?? 0,
      currentPreset: pos.currentPreset ?? 0,
      voltagePreset: pos.voltagePreset ?? 0
    }));
  }

  hasCurrentCapability(position: Position): boolean {
    this.logger.log('Current capability check:', {
      positionId: position.id,
      positionName: position.name,
      hasCurrent: position.current?.isPresent,
      currentData: position.current
    });
    return position.current?.isPresent ?? false;
  }

  hasVoltageCapability(position: Position): boolean {
    this.logger.log('Voltage capability check:', {
      positionId: position.id,
      positionName: position.name,
      hasVoltage: position.voltage?.isPresent,
      voltageData: position.voltage
    });
    return position.voltage?.isPresent ?? false;
  }
}

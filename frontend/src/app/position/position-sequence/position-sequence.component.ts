import { Component, ViewChild, ElementRef, HostBinding, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDragDrop, DragDropModule, CdkDrag, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { Position } from '../../models/position.model';
import { PositionService } from '../../services/position.service';
import { LoggerService } from '../../services/logger.service';
import { SidebarSheetComponent } from '../../sidebar-sheet/sidebar-sheet.component';
import { PositionDragDropService } from '../../services/position-drag-drop.service';
import { OverviewStateService } from '../../services/overview-state.service';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { SectionHeaderComponent } from '../../header/section-header/section-header.component';
import { EmptyspaceComponent } from '../../emptyspace/emptyspace.component';
import { ArticleService } from '../../services/article.service';
import { SnackbarService } from '../../services/snackbar.service';
import { Article } from '../../models/article.model';

interface Sequence {
  positionId: string;
  orderNumber: number;
  timePreset: number;
  currentPreset: number;
  voltagePreset: number;
  positionName: string;
}

type PresetField = 'timePreset' | 'currentPreset' | 'voltagePreset';

@Component({
  selector: 'app-position-sequence',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    SidebarSheetComponent,
    DragDropModule,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    SectionHeaderComponent,
    EmptyspaceComponent
  ],
  templateUrl: './position-sequence.component.html',
  styleUrls: ['./position-sequence.component.scss']
})
export class PositionSequenceComponent {
  @ViewChild('selectedPositionsContainer') selectedPositionsContainer?: ElementRef;
  @HostBinding('class.show-sheet') get showSheetClass() { return this.showPositionSelector; }
  @HostBinding('class.edit-mode') get editModeClass() { return this.isEditEnabled(); }
  
  @Input() selectedPositions: Position[] = [];
  @Input() enableEdit: boolean = false;
  @Output() selectedPositionsChange = new EventEmitter<Sequence[]>();
  showPositionSelector = false;
  private editingState: { position: Position | null, field: PresetField | null } = { position: null, field: null };
  public readonly editState = this.overviewStateService.enableEdit;
  isBottomSheet = false;
  @Input() article!: Article;

  readonly translations = {
    position: {
      aria: {
        card: 'Position {number}: {name}',
        select: {
          select: 'Position auswählen',
          deselect: 'Position abwählen'
        },
        remove: 'Position entfernen',
        drag: 'Position verschieben',
        add: 'Position hinzufügen',
        timePreset: 'Zeit in Sekunden: {value}'
      },
      tooltips: {
        select: {
          select: 'Position auswählen',
          deselect: 'Position abwählen'
        },
        remove: 'Position entfernen',
        drag: 'Position verschieben',
        add: 'Position hinzufügen',
        timePreset: 'Zeit in Sekunden'
      },
      buttons: {
        remove: 'Entfernen',
        add: 'Hinzufügen'
      },
      units: {
        time: 's'
      }
    }
  };

  constructor(
    public positionService: PositionService,
    private logger: LoggerService,
    private positionDragDropService: PositionDragDropService,
    private overviewStateService: OverviewStateService,
    private articleService: ArticleService,
    private snackbarService: SnackbarService
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
    this.logger.log('Drop event triggered', { 
      previousIndex: event.previousIndex, 
      currentIndex: event.currentIndex 
    });

    if (!this.selectedPositions) {
      return;
    }

    moveItemInArray(this.selectedPositions, event.previousIndex, event.currentIndex);

    const sequences = this.selectedPositions.map((position, index) => ({
      positionId: position.id.toString(),
      orderNumber: index + 1,
      timePreset: position.timePreset,
      currentPreset: position.currentPreset,
      voltagePreset: position.voltagePreset
    }));

    if (this.article) {
      this.logger.log('Updating article sequence', { articleId: this.article.id });
      this.articleService.updateSequenceOrder(this.article, sequences).subscribe({
        next: (updatedArticle) => {
          this.logger.log('Article sequence updated successfully', updatedArticle);
        },
        error: (error) => {
          this.logger.error('Failed to update article sequence', error);
          // Revert the visual change on error
          moveItemInArray(this.selectedPositions, event.currentIndex, event.previousIndex);
        }
      });
    }
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
    setTimeout(() => {
      const inputs = document.getElementsByClassName('value-input');
      if (inputs.length > 0) {
        const input = inputs[0] as HTMLInputElement;
        input.focus();
        input.select();
      }
    }, 0);
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
      voltagePreset: pos.voltagePreset ?? 0,
      positionName: pos.name
    }));
  }

  hasCurrentCapability(position: Position): boolean {
    return position.current?.isPresent ?? false;
  }

  hasVoltageCapability(position: Position): boolean {
    return position.voltage?.isPresent ?? false;
  }

  isEditEnabled(): boolean {
    return this.enableEdit || this.editState();
  }

  isButtonEnabled(): boolean {
    return this.enableEdit || this.editState();
  }

  drop(event: CdkDragDrop<any[]>) {
  }

  openSidebarSheet() {
    this.showPositionSelector = true;
  }

  onSheetConfigChange(event: any) {
    this.isBottomSheet = !!event;
  }

  onShowChange(event: boolean) {
    this.showPositionSelector = event;
  }
}

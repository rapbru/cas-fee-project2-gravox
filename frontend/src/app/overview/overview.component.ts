import { Component, computed, OnDestroy, OnInit, Input } from '@angular/core';
import { Position } from '../models/position.model';
import { PositionService } from '../services/position.service';
import { CommonModule } from '@angular/common';
import { PositionComponent } from '../position/position.component';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { DeviceDetectionService } from '../services/device-detection.service';
import { OverviewStateService } from '../services/overview-state.service';
import { AddPositionComponent } from '../position/add-position/add-position.component';
import { SnackbarService } from '../services/snackbar.service';
import { ColumnManagementService } from '../services/column-management.service';
import { PositionDragDropService } from '../services/position-drag-drop.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { HeaderService } from '../services/header.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule, 
    PositionComponent, 
    DragDropModule, 
    MatIconModule, 
    AddPositionComponent,
    MatTooltipModule,
    MatButtonModule,
    ToolbarComponent
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnDestroy, OnInit {
  @Input() showToolbar: boolean = true;
  public newPosition: Position | null = null;

  public readonly isMobile = this.deviceDetectionService.isMobileSignal;
  public readonly enableEdit = this.overviewStateService.enableEdit;
  public readonly enableOrder = this.overviewStateService.enableOrder;
  public readonly enableMultiSelect = this.overviewStateService.enableMultiSelect;

  columns = computed(() => {
    const positions = this.positionService.getPositions()();
    return this.columnManagementService.splitPositionsDynamically(positions);
  });

  constructor(
    private positionService: PositionService,
    public columnManagementService: ColumnManagementService,
    private deviceDetectionService: DeviceDetectionService,
    private positionDragDropService: PositionDragDropService,
    public overviewStateService: OverviewStateService,
    private snackbarService: SnackbarService,
    private headerService: HeaderService
  ) {
    this.columnManagementService.columnsChanged.subscribe(() => {
      this.positionService.refreshPositions();
    });
  }

  ngOnInit() {  
    this.headerService.setTitle('Übersicht');
    this.columnManagementService.loadColumnSettings().subscribe();
    this.positionService.startFetching();
  }

  ngOnDestroy() {
    this.positionService.stopFetching();
  }

  // Spalten-Management
  public increaseColumns() {
    this.columnManagementService.increaseColumns();
    this.positionService.refreshPositions();
  }

  public decreaseColumns() {
    this.columnManagementService.decreaseColumns();
    this.positionService.refreshPositions();
  }

  // Änderungen speichern/verwerfen
  public saveChanges() {
    this.positionService.saveAllChanges();
    this.overviewStateService.resetState();
  }

  public cancelChanges() {
    this.positionService.cancelAllChanges();
    this.overviewStateService.resetState();
  }

  // Position-Management
  public addPosition() {
    const randomId = -(Date.now() + Math.floor(Math.random() * 1000));
    this.newPosition = {
      id: randomId,
      number: '' as any,
      name: '',
      time: { actual: 0, preset: 0 },
      temperature: { actual: 0, preset: 0, isPresent: false },
      current: { actual: 0, preset: 0, isPresent: false },
      voltage: { actual: 0, preset: 0, isPresent: false }
    };
  }

  public savePosition(position: Position) {
    if (!position.number || position.number === 0 || !position.name || position.name.trim().length === 0) {
      this.snackbarService.showError('Positionsnummer und Name sind erforderlich');
      return;
    }
    
    this.positionService.handleTemporaryPosition(position);
    this.closeAddPosition();
  }

  public closeAddPosition() {
    this.newPosition = null;
  }

  // Drag & Drop
  public drop(event: CdkDragDrop<Position[]>, columnIndex: number) {
    if (this.enableOrder()) {
      this.positionDragDropService.handleDrop(event, this.columns(), columnIndex);
    }
  }

  // Position-Auswahl und Bearbeitung
  public orderPositions() {
    this.overviewStateService.toggleOrder();
  }

  public deletePositions() {
    this.positionService.markPositionsForDeletion();
  }

  hasSelectedPositions(): boolean {
    return !this.overviewStateService.enableOrder() && 
           this.positionService.editPositions().some(pos => pos.isSelected);
  }

  onAddLine() {
    this.increaseColumns();
  }

  onDeleteLine() {
    this.decreaseColumns();
  }

  onAdd() {
    this.addPosition();
  }

  onReorder() {
    this.orderPositions();
  }

  onDelete() {
    this.deletePositions();
  }
}

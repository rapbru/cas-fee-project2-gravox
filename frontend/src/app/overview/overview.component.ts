import { Component, computed, OnDestroy, OnInit } from '@angular/core';
import { Position } from '../models/position.model';
import { PositionService } from '../services/position.service';
import { CommonModule } from '@angular/common';
import { PositionComponent } from '../position/position.component';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { DeviceDetectionService } from '../services/device-detection.service';
import { OverviewStateService } from '../services/overview-state.service';
import { AddPositionComponent } from '../position/add-position/add-position.component';
import { ErrorHandlingService } from '../services/error-handling.service';
import { ColumnManagementService } from '../services/column-management.service';
import { PositionDragDropService } from '../services/position-drag-drop.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule, 
    PositionComponent, 
    DragDropModule, 
    MatIconModule, 
    AddPositionComponent
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnDestroy, OnInit {
  public newPosition: Position | null = null;

  public readonly isMobile = this.deviceDetectionService.isMobileSignal;
  public readonly enableEdit = this.overviewStateService.enableEdit;
  public readonly enableOrder = this.overviewStateService.enableOrder;
  public readonly enableMultiSelect = this.overviewStateService.enableMultiSelect;

  columns = computed(() => {
    const positions = this.positionService.orderedPositions();
    return this.columnManagementService.splitPositionsDynamically(positions);
  });

  constructor(
    private positionService: PositionService,
    private columnManagementService: ColumnManagementService,
    private deviceDetectionService: DeviceDetectionService,
    private positionDragDropService: PositionDragDropService,
    public overviewStateService: OverviewStateService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit() {  
    this.columnManagementService.loadColumnSettings().subscribe();
    this.positionService.startFetching();
  }

  ngOnDestroy() {
    this.positionService.stopFetching();
  }

  // Spalten-Management
  public increaseColumns() {
    this.columnManagementService.increaseColumns();
  }

  public decreaseColumns() {
    this.columnManagementService.decreaseColumns();
  }

  // Änderungen speichern/verwerfen
  public saveChanges() {
    this.positionService.saveAllChanges();
  }

  public cancelChanges() {
    this.positionService.cancelAllChanges();
  }

  // Position-Management
  public addPosition() {
    this.newPosition = {
      id: 0,
      number: 0,
      name: '',
      time: { actual: 0, preset: 0 },
      temperature: { actual: 0, preset: 0, isPresent: true },
      current: { actual: 0, preset: 0, isPresent: true },
      voltage: { actual: 0, preset: 0, isPresent: true }
    };
  }

  public savePosition(position: Position) {
    if (!position.number || position.number === 0 || !position.name || position.name.trim().length === 0) {
      this.errorHandlingService.showError('Positionsnummer und Name sind erforderlich');
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
    console.log(event);
    if (this.enableOrder()) {
      this.positionDragDropService.handleDrop(event, this.columns(), columnIndex);
    }
  }

  // Position-Auswahl und Bearbeitung
  public orderPositions() {
    this.overviewStateService.toggleOrder();
  }

  public deletePositions() {
    this.overviewStateService.toggleMultiSelect();
  }
}

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Position } from '../models/position.model';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DeviceDetectionService } from '../services/device-detection.service';
import { EditStateService } from '../services/edit-state.service';
import { OverviewStateService } from '../services/overview-state.service';
import { PositionService } from '../services/position.service';
import { PlcService } from '../services/plc.service';
import { ErrorHandlingService } from '../services/error-handling.service';

@Component({
  selector: 'app-position',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, MatCardModule, MatInputModule, MatButtonModule, MatFormFieldModule],
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.scss']
})
export class PositionComponent {
  @Input() position!: Position;
  public isCollapsed = false;
  public readonly enableEdit = this.editStateService.enableEdit;

  constructor(
    private deviceDetectionService: DeviceDetectionService,
    private editStateService: EditStateService,
    private overviewStateService: OverviewStateService,
    private errorHandlingService: ErrorHandlingService,
    private positionService: PositionService,
    private plcService: PlcService
  ) {}

  updatePresetValue(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    const value = parseFloat(inputElement.value);
    
    if (isNaN(value) || value <= 0) return;

    const tagName = `POS[${this.position.number}]${field}`;
    
    const update = {
      tagName,
      value: field.includes('TIME') ? value * 60 : value
    };

    this.plcService.writeValues([update]).subscribe({
      error: (error) => {
        this.errorHandlingService.showError(`Fehler beim Setzen des Wertes für ${tagName}`, error);
      }
    });
  }

  updatePositionInfo(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    const newValue = inputElement.value;

    switch (field) {
      case 'name':
        this.position.name = newValue;
        break;
      case 'number':
        this.position.number = parseInt(newValue, 10);
        break;
    }
    
    this.positionService.trackModification(this.position);
    this.editStateService.setHasChanges(true);
  }  

  get collapsed(): boolean {
    return !(this.isCollapsed || this.position?.flightbar);
  }

  toggleIsPresent(type: string) {
    switch (type) {
      case 'temperature':
        this.position.temperature.isPresent = !this.position.temperature.isPresent;
        break;
      case 'current':
        this.position.current.isPresent = !this.position.current.isPresent;
        break;
      case 'voltage':
        this.position.voltage.isPresent = !this.position.voltage.isPresent;
        break;
    }
    this.positionService.trackModification(this.position);
    this.editStateService.setHasChanges(true);
  }

  toggleCollapsed() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSelection() {
    this.position.isSelected = !this.position.isSelected;
    this.positionService.trackModification(this.position);
    this.editStateService.setHasChanges(true);
  }

  get isSelected(): boolean {
    return this.position.isSelected || false;
  }

  isMobile(): boolean {
    return this.deviceDetectionService.isMobileSignal();
  }

  enableOrder(): boolean {
    return this.overviewStateService.enableOrder();
  }

  enableMultiSelect(): boolean {
    return this.overviewStateService.enableMultiSelect();
  }

  selectInputContent(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  toggleMetric(type: string) {
    this.toggleIsPresent(type);
    this.editStateService.setHasChanges(true);
  }

  onDragStart(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', this.position.number.toString());
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      const sourceNumber = parseInt(event.dataTransfer.getData('text/plain'), 10);
      const positions = this.positionService.orderedPositions();
      const sourceIndex = positions.findIndex(p => p.number === sourceNumber);
      const targetIndex = positions.findIndex(p => p.number === this.position.number);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const newPositions = [...positions];
        const [removed] = newPositions.splice(sourceIndex, 1);
        newPositions.splice(targetIndex, 0, removed);
        this.positionService.orderedPositions.set(newPositions);
        this.editStateService.setHasChanges(true);
      }
    }
  }
}

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
import { OverviewStateService } from '../services/overview-state.service';
import { PositionService } from '../services/position.service';
import { PlcService } from '../services/plc.service';
import { SnackbarService } from '../services/snackbar.service';


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

  constructor(
    private deviceDetectionService: DeviceDetectionService,
    private overviewStateService: OverviewStateService,
    private snackbarService: SnackbarService,
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
        this.snackbarService.showError(`Fehler beim Setzen des Wertes für ${tagName}`, error);
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
  }

  toggleCollapsed() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSelection() {
    this.position.isSelected = !this.position.isSelected;
    this.positionService.trackModification(this.position);
  }

  get isSelected(): boolean {
    return this.position.isSelected || false;
  }

  isMobile(): boolean {
    return this.deviceDetectionService.isMobileSignal();
  }

  enableEdit(): boolean {
    return this.overviewStateService.enableEdit();
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
}

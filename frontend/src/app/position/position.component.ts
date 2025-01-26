import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { DragDropModule } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-position',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatTooltipModule,
    FormsModule, 
    MatCardModule, 
    MatInputModule, 
    MatButtonModule, 
    MatFormFieldModule,
    DragDropModule
  ],
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.scss']
})
export class PositionComponent {
  @Input() position!: Position;
  public isCollapsed = false;

  readonly translations = {
    position: {
      aria: {
        container: 'Position {number}: {name}',
        header: 'Position Header {number}',
        number: 'Position number',
        name: 'Position name',
        dragHandle: 'Position verschieben',
        select: {
          select: 'Position auswählen',
          deselect: 'Position abwählen'
        },
        timePreset: 'Zeit Voreinstellung'
      },
      tooltips: {
        dragHandle: 'Zum Verschieben ziehen',
        number: 'Positionsnummer bearbeiten',
        name: 'Positionsname bearbeiten',
        time: 'Zeit in Minuten (max. 3 Ziffern)',
        temperature: {
          enable: 'Temperatur aktivieren',
          disable: 'Temperatur deaktivieren'
        }
      },
      units: {
        time: 'min'
      }
    }
  };

  constructor(
    private deviceDetectionService: DeviceDetectionService,
    private overviewStateService: OverviewStateService,
    private snackbarService: SnackbarService,
    private positionService: PositionService,
    private plcService: PlcService
  ) {}

  onNameInput(event: Event, maxLength: number = 30) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    value = value.slice(0, maxLength);
    
    input.value = value;
    
    return value;
  }

  updatePresetValue(event: Event, field: string) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    console.log(value);
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 999.99) {
      input.value = '0';
      return;
    }

    const tagName = `POS[${this.position.number}]${field}`;
    
    const update = {
      tagName,
      value: field.includes('TIME') ? numValue * 60 : numValue
    };
    console.log(update);

    this.plcService.writeValues([update]).subscribe({
      error: (error) => {
        this.snackbarService.showError(`Fehler beim Setzen des Wertes für ${tagName}`, error);
      }
    });
  }

  updatePositionInfo(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    let newValue: string = inputElement.value;

    switch (field) {
      case 'name':
        newValue = this.onNameInput(event);
        this.position.name = newValue;
        break;
      case 'number':
        newValue = newValue.replace(/[^0-9]/g, '').slice(0, 3);
        inputElement.value = newValue;
        this.position.number = parseInt(newValue, 10) || 0;
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
    setTimeout(() => {
      input.select();
    }, 0);
  }

  shouldShowMetrics(): boolean {
    return !this.overviewStateService.enableOrder() && 
           !this.overviewStateService.enableEdit();
  }

  shouldShowFlightbar(): boolean {
    return !this.overviewStateService.enableEdit();
  }
}

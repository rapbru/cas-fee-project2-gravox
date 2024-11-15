import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Position } from '../position/position.model';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DeviceDetectionService } from '../services/device-detection.service';
import { EditStateService } from '../services/edit-state.service';


@Component({
  selector: 'app-position',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, MatCardModule, MatInputModule, MatButtonModule, MatFormFieldModule],
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.scss']
})
export class PositionComponent {
  @Input() position!: Position;

  constructor(private deviceDetectionService: DeviceDetectionService, private editStateService: EditStateService) {}

  updatePresetValue(event: KeyboardEvent, field: string) {
    if (event.key === 'Enter') {
      const inputElement = event.target as HTMLInputElement;
      const newValue = inputElement.value;
      console.log(newValue);
      console.log(field);
      console.log(this.position.number);
    }
  }

  isMobile(): boolean {
    return this.deviceDetectionService.isMobileSignal();
  }
}

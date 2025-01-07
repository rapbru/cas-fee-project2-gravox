import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Position } from '../../models/position.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-add-position',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatSlideToggleModule
  ],
  templateUrl: './add-position.component.html',
  styleUrls: ['./add-position.component.scss']
})
export class AddPositionComponent {
  @Input() position: Position | undefined;
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() savePosition = new EventEmitter<Position>();

  confirmChanges() {
    this.savePosition.emit(this.position);
  }

  cancelChanges() {
    this.cancelEdit.emit();
  }
}

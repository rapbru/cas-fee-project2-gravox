import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PositionService } from '../services/position.service';
import { Position } from '../position.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-position-edit',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './position-edit.component.html',
  styleUrls: ['./position-edit.component.scss']
})
export class PositionEditComponent {
  @Input() position: Position | undefined;
  @Output() closeEdit = new EventEmitter<void>();

  constructor(private positionService: PositionService) {}

  saveChanges() {
    if (this.position) {
      this.positionService.savePosition(this.position).subscribe(() => {
        this.positionService.showSuccessMessage();
        this.closeEdit.emit();
      });
    }
  }

  cancelChanges() {
    this.closeEdit.emit();
  }
}

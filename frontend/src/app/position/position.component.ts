import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Position } from './position.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-position',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './position.component.html',
  styleUrl: './position.component.scss'
})

export class PositionComponent {
  @Input() position: Position | undefined;
  @Output() selectPosition  = new EventEmitter<Position>();

  onSelect() {
    if (this.position) {
      this.selectPosition.emit(this.position);
    }
  }
}

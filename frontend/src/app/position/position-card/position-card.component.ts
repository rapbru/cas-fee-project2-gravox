import { Component, Input } from '@angular/core';
import { Position } from '../../models/position.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-position-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './position-card.component.html',
  styleUrls: ['./position-card.component.scss']
})
export class PositionCardComponent {
  @Input() position!: Position;
  @Input() isEditable = false;
  @Input() showCheckbox = true;
  @Input() showHeader = true;
}

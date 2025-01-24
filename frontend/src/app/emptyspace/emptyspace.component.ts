import { Component, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-emptyspace',
  templateUrl: './emptyspace.component.html',
  styleUrls: ['./emptyspace.component.scss'],
  standalone: true,
  imports: [
    MatIconModule
  ]
})
export class EmptyspaceComponent {
  @Output() addClick = new EventEmitter<void>();

  onAddClick() {
    this.addClick.emit();
  }
}

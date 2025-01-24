import { Component, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-emptyspace',
  templateUrl: './emptyspace.component.html',
  styleUrls: ['./emptyspace.component.scss'],
  standalone: true,
  imports: [
    MatIconModule,
    MatTooltipModule
  ]
})
export class EmptyspaceComponent {
  @Output() addClick = new EventEmitter<void>();

  readonly translations = {
    emptyspace: {
      aria: {
        addButton: 'Position hinzufügen'
      },
      tooltips: {
        addButton: 'Position hinzufügen'
      },
      text: {
        subtext: 'Fügen Sie Positionen hinzu, um eine Sequenz zu erstellen'
      }
    }
  };

  onAddClick() {
    this.addClick.emit();
  }
}

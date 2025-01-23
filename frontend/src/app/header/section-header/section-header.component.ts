import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ToolbarComponent } from '../../toolbar/toolbar.component';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, ToolbarComponent],
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.scss']
})
export class SectionHeaderComponent {
  @Input() title: string = '';
  @Input() showDelete: boolean = false;
  @Input() deleteDisabled: boolean = true;
  @Input() showAdd: boolean = false;
  
  @Output() delete = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();
}

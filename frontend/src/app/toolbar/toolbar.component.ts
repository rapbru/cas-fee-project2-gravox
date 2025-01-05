import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './toolbar.component.html'
})
export class ToolbarComponent {
  @Input() showAddLine = false;
  @Input() showDeleteLine = false;
  @Input() showAdd = false;
  @Input() showReorder = false;
  @Input() showDelete = false;
  @Input() showNavigateAdd = false;
  @Input() deleteDisabled = true;
  @Input() isReorderMode = false;

  @Output() addLine = new EventEmitter<void>();
  @Output() deleteLine = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();
  @Output() reorder = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  constructor(private router: Router) {}

  onNavigateToAddArticle() {
    this.router.navigate(['/add-article']);
  }
}

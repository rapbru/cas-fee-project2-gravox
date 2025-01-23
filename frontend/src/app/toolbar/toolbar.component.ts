import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
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
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Input() showAddLine = false;
  @Input() showDeleteLine = false;
  @Input() showAdd = false;
  @Input() showReorder = false;
  @Input() showDelete = false;
  @Input() showNavigateAdd = false;
  @Input() showLoad = false;
  @Input() deleteDisabled = true;
  @Input() loadDisabled = true;
  @Input() isReorderMode = false;
  @Input() addLineDisabled = false;
  @Input() deleteLineDisabled = false;
  @Input() addDisabled: boolean = false;

  @Output() addLine = new EventEmitter<void>();
  @Output() deleteLine = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();
  @Output() reorder = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() load = new EventEmitter<void>();

  showToolbar = computed(() => {
    return (
      (this.showReorder) ||
      (this.showNavigateAdd) ||
      (this.showAdd && !this.isReorderMode) ||
      (this.showAddLine && this.isReorderMode) ||
      (this.showLoad) ||
      (this.showDeleteLine && this.isReorderMode) ||
      (this.showDelete && !this.isReorderMode)
    );
  });

  constructor(private router: Router) {}

  onNavigateToAddArticle() {
    this.router.navigate(['/add-article']);
  }
}

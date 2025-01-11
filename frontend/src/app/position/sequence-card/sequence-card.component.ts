import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Position } from '../../models/position.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-sequence-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    DragDropModule
  ],
  template: `
    <div class="position-card" cdkDrag [cdkDragData]="position">
      <div class="position-header">
        <button mat-icon-button class="check-circle" (click)="toggleSelection.emit(position)">
          <mat-icon class="check-circle-icon" [ngClass]="{ 'selected': position.isSelected }">
            {{ position.isSelected ? 'check_circle' : 'radio_button_unchecked' }}
          </mat-icon>
        </button>
        <span class="position-number">{{ index + 1 }}</span>
        <span class="position-name">{{ position.name }}</span>
        <button class="button button-label button-highlight-sub" (click)="remove.emit(position)">
          <mat-icon>remove</mat-icon>
          <span>Entfernen</span>
        </button>
        <div class="drag-handle" cdkDragHandle>
          <mat-icon>drag_handle</mat-icon>
        </div>
      </div>
      <div class="position-details">
        <div class="metric-column" *ngIf="position.timePreset !== undefined">
          <mat-icon [class.disabled]="position.timePreset === 0">timer</mat-icon>
          <span class="label" [class.disabled]="position.timePreset === 0">Zeit</span>
          <span class="value" 
                (click)="startEditing.emit({position, field: 'timePreset'})"
                *ngIf="!isEditing(position, 'timePreset')">
            {{ position.timePreset | number:'1.2-2' }}<span class="unit" [class.disabled]="position.timePreset === 0">s</span>
          </span>
          <input #valueInput
                 class="value-input" 
                 *ngIf="isEditing(position, 'timePreset')"
                 [value]="formatNumber(position.timePreset)"
                 (keydown)="onKeyDown($event)"
                 (keydown.enter)="confirmEdit.emit({position, field: 'timePreset', value: valueInput.value})"
                 (keydown.escape)="cancelEdit.emit()"
                 (blur)="confirmEdit.emit({position, field: 'timePreset', value: valueInput.value})"
                 (paste)="$event.preventDefault()"
                 type="text"
                 inputmode="decimal">
        </div>
        <div class="metric-column" *ngIf="position.currentPreset !== undefined">
          <mat-icon [class.disabled]="position.currentPreset === 0">bolt</mat-icon>
          <span class="label" [class.disabled]="position.currentPreset === 0">Strom</span>
          <span class="value" 
                (click)="startEditing.emit({position, field: 'currentPreset'})"
                *ngIf="!isEditing(position, 'currentPreset')">
            {{ position.currentPreset | number:'1.2-2' }}<span class="unit" [class.disabled]="position.currentPreset === 0">A</span>
          </span>
          <input #valueInput
                 class="value-input" 
                 *ngIf="isEditing(position, 'currentPreset')"
                 [value]="formatNumber(position.currentPreset)"
                 (keydown)="onKeyDown($event)"
                 (keydown.enter)="confirmEdit.emit({position, field: 'currentPreset', value: valueInput.value})"
                 (keydown.escape)="cancelEdit.emit()"
                 (blur)="confirmEdit.emit({position, field: 'currentPreset', value: valueInput.value})"
                 (paste)="$event.preventDefault()"
                 type="text"
                 inputmode="decimal">
        </div>
        <div class="metric-column" *ngIf="position.voltagePreset !== undefined">
          <mat-icon class="mat-icon-filled" [class.disabled]="position.voltagePreset === 0">bolt</mat-icon>
          <span class="label" [class.disabled]="position.voltagePreset === 0">Spannung</span>
          <span class="value" 
                (click)="startEditing.emit({position, field: 'voltagePreset'})"
                *ngIf="!isEditing(position, 'voltagePreset')">
            {{ position.voltagePreset | number:'1.2-2' }}<span class="unit" [class.disabled]="position.voltagePreset === 0">V</span>
          </span>
          <input #valueInput
                 class="value-input" 
                 *ngIf="isEditing(position, 'voltagePreset')"
                 [value]="formatNumber(position.voltagePreset)"
                 (keydown)="onKeyDown($event)"
                 (keydown.enter)="confirmEdit.emit({position, field: 'voltagePreset', value: valueInput.value})"
                 (keydown.escape)="cancelEdit.emit()"
                 (blur)="confirmEdit.emit({position, field: 'voltagePreset', value: valueInput.value})"
                 (paste)="$event.preventDefault()"
                 type="text"
                 inputmode="decimal">
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./sequence-card.component.scss']
})
export class SequenceCardComponent {
  @Input() position!: Position;
  @Input() index!: number;
  @Input() editingPosition: Position | null = null;
  @Input() editingField: string | null = null;

  @Output() toggleSelection = new EventEmitter<Position>();
  @Output() remove = new EventEmitter<Position>();
  @Output() startEditing = new EventEmitter<{position: Position, field: string}>();
  @Output() confirmEdit = new EventEmitter<{position: Position, field: string, value: string}>();
  @Output() cancelEdit = new EventEmitter<void>();

  isEditing(position: Position, field: string): boolean {
    return this.editingPosition === position && this.editingField === field;
  }

  formatNumber(value: number): string {
    return value.toFixed(2);
  }

  onKeyDown(event: KeyboardEvent) {
    // Allow only numbers, decimal point, backspace, delete, arrow keys
    if (
      !/[\d\.]/.test(event.key) && 
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(event.key)
    ) {
      event.preventDefault();
    }
  }
}

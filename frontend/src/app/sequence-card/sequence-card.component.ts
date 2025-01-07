import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { Sequence } from '../models/article.model';

@Component({
  selector: 'app-sequence-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    CdkDragHandle
  ],
  template: `
    <div class="sequence-item" [class.editable]="isEditable">
      <div class="sequence-content">
        <div class="sequence-details">
          <div class="detail-row">
            <mat-icon>tag</mat-icon>
            <span class="label">Position ID:</span>
            <span class="value">{{ sequence.positionId }}</span>
          </div>
          <div class="detail-row">
            <mat-icon>format_list_numbered</mat-icon>
            <span class="label">Order Number:</span>
            <span class="value">{{ sequence.orderNumber }}</span>
          </div>
          <div class="detail-row">
            <mat-icon>timer</mat-icon>
            <span class="label">Time Preset:</span>
            <span class="value">{{ sequence.timePreset }}</span>
          </div>
          <div class="detail-row">
            <mat-icon>electric_bolt</mat-icon>
            <span class="label">Current Preset:</span>
            <span class="value">{{ sequence.currentPreset }}</span>
          </div>
          <div class="detail-row">
            <mat-icon>bolt</mat-icon>
            <span class="label">Voltage Preset:</span>
            <span class="value">{{ sequence.voltagePreset }}</span>
          </div>
        </div>
        @if (isEditable) {
          <div class="drag-handle" cdkDragHandle>
            <mat-icon>drag_indicator</mat-icon>
          </div>
        }
      </div>
    </div>
  `
})
export class SequenceCardComponent {
  @Input() sequence!: Sequence;
  @Input() isEditable: boolean = false;
} 
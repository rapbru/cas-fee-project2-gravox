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
  template: `
    <div class="position-card" [class.editable]="isEditable">
      <div class="position-header" *ngIf="showHeader">
        <div class="position-title">
          Position {{position.number}}
        </div>
        <div class="position-checkbox" *ngIf="showCheckbox">
          <input type="checkbox" [(ngModel)]="position.isSelected">
        </div>
      </div>
      
      <div class="position-content">
        <div class="position-info">
          <div class="info-row">
            <mat-icon>numbers</mat-icon>
            <span class="label">Position:</span>
            <span class="value">{{position.number}}</span>
          </div>
          <div class="info-row">
            <mat-icon>label</mat-icon>
            <span class="label">Name:</span>
            <span class="value">{{position.name}}</span>
          </div>
          <div class="info-row" *ngIf="position.timePreset !== undefined">
            <mat-icon>timer</mat-icon>
            <span class="label">Zeit:</span>
            <span class="value">{{position.timePreset}} min</span>
          </div>
          <div class="info-row" *ngIf="position.currentPreset !== undefined">
            <mat-icon>bolt</mat-icon>
            <span class="label">Strom:</span>
            <span class="value">{{position.currentPreset}} A</span>
          </div>
          <div class="info-row" *ngIf="position.voltagePreset !== undefined">
            <mat-icon>electric_meter</mat-icon>
            <span class="label">Spannung:</span>
            <span class="value">{{position.voltagePreset}} V</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .position-card {
      background-color: var(--color-main);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;

      &.editable {
        cursor: move;
      }

      &:hover {
        border-color: var(--color-vonesco-sub-2);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
    }

    .position-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .position-title {
      font-size: 1.1em;
      font-weight: 500;
      color: var(--color-text);
    }

    .position-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;

      mat-icon {
        color: var(--color-text-sub);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .label {
        color: var(--color-text-sub);
        min-width: 80px;
      }

      .value {
        color: var(--color-text);
      }
    }
  `]
})
export class PositionCardComponent {
  @Input() position!: Position;
  @Input() isEditable = false;
  @Input() showCheckbox = true;
  @Input() showHeader = true;
}

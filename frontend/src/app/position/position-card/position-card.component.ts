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
      <div class="position-content">
        <div class="position-info">
          <div class="info-column">
            <div class="info-header">
              <mat-icon>timer</mat-icon>
              <span>Zeit (min)</span>
            </div>
            <div class="info-value">{{position.timePreset}}</div>
          </div>
          
          <div class="info-column">
            <div class="info-header">
              <mat-icon>bolt</mat-icon>
              <span>Strom (A)</span>
            </div>
            <div class="info-value">{{position.currentPreset}}</div>
          </div>
          
          <div class="info-column">
            <div class="info-header">
              <mat-icon>electric_meter</mat-icon>
              <span>Spannung (V)</span>
            </div>
            <div class="info-value">{{position.voltagePreset}}</div>
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
      width: 100%;

      &.editable {
        cursor: move;
      }

      &:hover {
        border-color: var(--color-vonesco-sub-2);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
    }

    .position-content {
      display: flex;
      flex-direction: column;
    }

    .position-info {
      display: flex;
      justify-content: space-between;
      gap: 24px;
    }

    .info-column {
      flex: 1;
      text-align: center;
      
      .info-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 8px;
        color: var(--color-text-sub);
        
        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
      
      .info-value {
        font-size: 1.2em;
        font-weight: 500;
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

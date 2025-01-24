import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { Position } from '../../models/position.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { InputFieldComponent } from '../../input-field/input-field.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-add-position',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatSlideToggleModule,
    InputFieldComponent,
    MatTooltipModule
  ],
  templateUrl: './add-position.component.html',
  styleUrls: ['./add-position.component.scss']
})
export class AddPositionComponent implements OnInit {
  @Input() position: Position | undefined;
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() savePosition = new EventEmitter<Position>();

  isMobile: boolean = window.innerWidth < 768;
  enableTransitions: boolean = false;
  isInitialized: boolean = false;

  ngOnInit() {
    this.checkScreenSize();
  }

  ngOnChanges() {
    if (this.position && !this.isInitialized) {
      // Delay enabling transitions until after initial render
      setTimeout(() => {
        this.isInitialized = true;
        setTimeout(() => {
          this.enableTransitions = true;
        }, 0);
      }, 0);
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;
    
    if (wasMobile !== this.isMobile && this.position) {
      this.cancelChanges();
    }
  }

  confirmChanges() {
    this.savePosition.emit(this.position);
  }

  cancelChanges() {
    this.enableTransitions = false;
    this.isInitialized = false;
    this.cancelEdit.emit();
  }

  onNumberChange(value: string) {
    if (this.position) {
      this.position.number = value ? parseInt(value, 10) : 0;
    }
  }

  onNameChange(value: string) {
    if (this.position) {
      this.position.name = value;
    }
  }
}

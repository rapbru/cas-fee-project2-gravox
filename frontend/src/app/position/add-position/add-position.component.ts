import { Component, Input, Output, EventEmitter, HostListener, OnInit, ViewChild } from '@angular/core';
import { Position } from '../../models/position.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { InputFieldComponent } from '../../input-field/input-field.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgForm } from '@angular/forms';
import { PositionService } from '../../services/position.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { OverviewStateService } from '../../services/overview-state.service';

interface PositionForm {
  number: string;
  name: string;
}

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
  @ViewChild('positionForm') positionForm!: NgForm;

  isMobile: boolean = window.innerWidth < 768;
  enableTransitions: boolean = false;
  isInitialized: boolean = false;

  positionFormData: PositionForm = {
    number: '',
    name: ''
  };

  constructor(
    private positionService: PositionService,
    private router: Router,
    private overviewStateService: OverviewStateService
  ) {}

  ngOnInit() {
    this.checkScreenSize();
  }

  ngOnChanges() {
    if (this.position && !this.isInitialized) {
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
    this.positionFormData.number = value;
  }

  onNameChange(value: string) {
    this.positionFormData.name = value;
  }

  isFormValid(): boolean {
    return !!(
      this.positionFormData.number?.trim() &&
      this.positionFormData.name?.trim()
    );
  }

  onSave(): void {
    if (!this.isFormValid()) return;

    const positionData: Position = {
      id: -1,
      number: parseInt(this.positionFormData.number, 10),
      name: this.positionFormData.name,
      flightbar: 0,
      articleName: '',
      customerName: '',
      time: {
        actual: 0,
        preset: 0
      },
      temperature: {
        actual: 0,
        preset: 0,
        isPresent: false
      },
      current: {
        actual: 0,
        preset: 0,
        isPresent: false
      },
      voltage: {
        actual: 0,
        preset: 0,
        isPresent: false
      }
    };

    this.positionService.createPosition(positionData).subscribe({
      next: () => {
        if (this.overviewStateService.enableEdit()) {
          this.overviewStateService.toggleEdit();
        }
        this.router.navigate(['/positions']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error saving position:', error);
      }
    });
  }
}

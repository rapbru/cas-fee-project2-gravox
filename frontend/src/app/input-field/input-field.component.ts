import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './input-field.component.html'
})
export class InputFieldComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() maxLength?: number;
  @Input() required = false;
  @Input() placeholder = '';
  @Input() fieldId = '';
  @Input() ariaLabel = '';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() touched = new EventEmitter<void>();

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(input.value);
  }

  onInputChange(event: Event): void {
    this.onInput(event);
  }

  onTouched(): void {
    this.touched.emit();
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './input-field.component.html',
})
export class InputFieldComponent {
  @Input() inputValue = '';
  @Input() maxLength = 160;
  @Input() placeholder = '';
  @Input() ariaLabel = '';
  @Input() label = '';
  @Input() fieldId = '';

  @Output() inputValueChange = new EventEmitter<string>();

  flashCounter = false;
  isFocused = false;

  onInputChange(): void {
    const inputLength = this.inputValue?.length || 0;
    if (inputLength >= this.maxLength) {
      this.flashCounter = true;
      setTimeout(() => {
        this.flashCounter = false;
      }, 1000);
    }
    this.inputValueChange.emit(this.inputValue);
  }
}

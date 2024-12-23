import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFieldComponent),
      multi: true
    }
  ],
  templateUrl: './input-field.component.html'
})
export class InputFieldComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() maxLength = 100;
  @Input() ariaLabel = '';
  @Input() fieldId = '';

  value: string = '';
  disabled: boolean = false;

  // Function to call when the input changes
  onChange = (_: any) => { };
  
  // Function to call when the input is touched
  onTouched = () => { };

  // Write a new value to the element
  writeValue(value: any): void {
    if (value !== undefined) {
      this.value = value;
    }
  }

  // Register a function to call when the value changes
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Register a function to call when the input is touched
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Set the disabled state
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Update the value and call the change function
  onInputChange(event: any): void {
    this.value = event.target.value;
    this.onChange(this.value);
    this.onTouched();
  }
}

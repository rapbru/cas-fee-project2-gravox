import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
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
  template: `
    <div class="input-field">
      <div class="input-field-header">
        <label class="input-field-label" [for]="name">{{ label }}</label>
        <span class="input-field-counter" [class.visible]="showCounter" [class.flash-limit]="isAtLimit">
          {{ value.length || 0 }}/{{ getEffectiveMaxLength() }} {{ numbersOnly ? 'Zahlen' : 'Zeichen' }}
        </span>
      </div>
      <div class="input-wrapper">
        <input
          [id]="name"
          [name]="name"
          [type]="type"
          [required]="required"
          [maxlength]="unit ? maxLength + unit.length + 1 : maxLength"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [class.flash-limit]="isAtLimit"
          class="input-field-value"
          [ngModel]="displayValue"
          (ngModelChange)="onInputChange($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          (keypress)="onKeyPress($event)"
        />
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFieldComponent),
      multi: true
    }
  ]
})
export class InputFieldComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() type: string = 'text';
  @Input() required: boolean = false;
  @Input() maxLength: number = 0;
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() numbersOnly: boolean = false;
  @Input() unit: string = '';

  value: string = '';
  displayValue: string = '';
  isAtLimit: boolean = false;
  showCounter: boolean = false;
  isFocused: boolean = false;

  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: string): void {
    this.value = value;
    this.updateDisplayValue();
    this.checkLimit();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(value: string): void {
    if (this.unit && value.endsWith(this.unit)) {
      value = value.slice(0, -this.unit.length).trim();
    }
    
    if (this.numbersOnly) {
      value = value.replace(/[^0-9]/g, '');
    }
    
    if (this.maxLength > 0 && value.length > this.getEffectiveMaxLength()) {
      value = value.slice(0, this.getEffectiveMaxLength());
    }
    
    this.value = value;
    this.updateDisplayValue();
    this.onChange(value);
    this.checkLimit();
    this.updateCounterVisibility();
  }

  onBlur(): void {
    this.onTouched();
    this.isFocused = false;
    this.updateDisplayValue();
    this.updateCounterVisibility();
  }

  onFocus(): void {
    this.isFocused = true;
    this.updateCounterVisibility();
  }

  private updateCounterVisibility(): void {
    this.showCounter = this.maxLength > 0 && (this.isFocused || (this.value?.length || 0) > 0);
  }

  private checkLimit(): void {
    if (this.maxLength > 0) {
      this.isAtLimit = (this.value?.length || 0) >= this.getEffectiveMaxLength();
    }
  }

  getEffectiveMaxLength(): number {
    return this.maxLength;
  }

  onKeyPress(event: KeyboardEvent): void {
    if (this.numbersOnly) {
      const isNumber = /[0-9]/.test(event.key);
      const isControlKey = event.ctrlKey || event.metaKey;
      const isAllowedKey = event.key === 'Backspace' || 
                          event.key === 'Delete' || 
                          event.key === 'ArrowLeft' || 
                          event.key === 'ArrowRight' || 
                          event.key === 'Tab';

      if (!isNumber && !isControlKey && !isAllowedKey) {
        event.preventDefault();
      }
    }
  }

  private updateDisplayValue(): void {
    this.displayValue = this.value + (this.value && this.unit ? ' ' + this.unit : '');
  }
}

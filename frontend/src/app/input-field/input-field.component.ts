import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="input-field">
      <div class="input-field-header">
        <label class="input-field-label" [for]="name">{{ label }}</label>
        <span class="input-field-counter" [class.visible]="showCounter" [class.flash-limit]="isAtLimit">
          {{ value.length || 0 }}/{{ maxLength }}
        </span>
      </div>
      <input
        [id]="name"
        [name]="name"
        [type]="type"
        [required]="required"
        [maxlength]="maxLength"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [class.flash-limit]="isAtLimit"
        class="input-field-value"
        [ngModel]="value"
        (ngModelChange)="onInputChange($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
      />
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

  value: string = '';
  isAtLimit: boolean = false;
  showCounter: boolean = false;
  isFocused: boolean = false;

  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: string): void {
    this.value = value;
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
    this.value = value;
    this.onChange(value);
    this.checkLimit();
    this.updateCounterVisibility();
  }

  onBlur(): void {
    this.onTouched();
    this.isFocused = false;
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
      this.isAtLimit = (this.value?.length || 0) >= this.maxLength;
    }
  }
}

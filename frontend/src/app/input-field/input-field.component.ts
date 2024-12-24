import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [
    NgIf,
    MatFormField,
    MatLabel,
    MatHint,
    MatInput
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFieldComponent),
      multi: true
    }
  ],
  template: `
    <mat-form-field>
      <mat-label>{{ label }}</mat-label>
      <input matInput
             [id]="fieldId"
             [attr.aria-label]="ariaLabel"
             [placeholder]="placeholder"
             [required]="required"
             [attr.maxlength]="maxLength"
             [disabled]="disabled"
             [value]="value"
             (input)="onInputChange($event)"
             (blur)="markAsTouched()">
      <mat-hint *ngIf="maxLength" align="end">{{value.length || 0}}/{{maxLength}}</mat-hint>
    </mat-form-field>
  `,
  styleUrls: ['./input-field.component.scss']
})
export class InputFieldComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() maxLength?: number;
  @Input() required = false;
  @Input() placeholder = '';
  @Input() fieldId = '';
  @Input() ariaLabel = '';
  @Input() disabled = false;

  private _value = '';
  private onChange: (value: string) => void = () => { /* will be set by registerOnChange */ };
  private onTouched = (): void => { /* will be set by registerOnTouched */ };

  get value(): string {
    return this._value;
  }

  set value(val: string) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val);
    }
  }

  writeValue(value: string): void {
    if (value !== this._value) {
      this._value = value;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
  }

  markAsTouched(): void {
    this.onTouched();
  }
}

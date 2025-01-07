import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header-container">
      <div class="app-container">
        <h1 class="font-main">{{ title }}</h1>
      </div>
    </div>
  `,
  styles: []
})
export class HeaderComponent {
  @Input() title: string = '';
} 
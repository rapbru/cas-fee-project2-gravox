import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header-container">
      <h1 class="font-main">{{ title }}</h1>
    </div>
  `,
  styles: [`
    .header-container {
      padding: 16px 20px;
      background-color: var(--color-main);
      border-bottom: 1px solid var(--color-border);
    }
    
    h1 {
      margin: 0;
      font-size: 24px;
      color: var(--color-text);
    }
  `]
})
export class HeaderComponent {
  @Input() title: string = '';
} 
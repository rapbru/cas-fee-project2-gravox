import { Injectable, signal } from '@angular/core';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'preferred-theme';
  private systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  private themePreference = signal<string | null>(localStorage.getItem(this.THEME_KEY));

  constructor(private logger: LoggerService) {
    this.systemPrefersDark.addEventListener('change', this.handleSystemThemeChange.bind(this));
    
    if (!this.systemPrefersDark.matches && !this.themePreference()) {
      document.documentElement.classList.add('light-theme');
    }
    
    this.applyTheme();
  }

  private handleSystemThemeChange(e: MediaQueryListEvent): void {
    if (this.themePreference() === null) {
      if (!e.matches) {
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
      }
      this.applyTheme();
    }
  }

  toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    this.themePreference.set(newTheme);
    localStorage.setItem(this.THEME_KEY, newTheme);
    
    this.applyTheme();
  }

  resetToSystemPreference(): void {
    localStorage.removeItem(this.THEME_KEY);
    this.themePreference.set(null);
    if (!this.systemPrefersDark.matches) {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    this.applyTheme();
  }

  getCurrentTheme(): string {
    const userPreference = this.themePreference();
    if (userPreference) {
      return userPreference;
    }
    return this.systemPrefersDark.matches ? 'dark' : 'light';
  }

  private applyTheme(): void {
    const isDark = this.getCurrentTheme() === 'dark';
    
    if (isDark) {
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
    
    this.logger.log(`Theme changed to ${isDark ? 'dark' : 'light'} mode`);
  }
} 
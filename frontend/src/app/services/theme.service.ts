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
    this.logger.log('ThemeService initialized', {
      storedPreference: this.themePreference(),
      systemDark: this.systemPrefersDark.matches
    });
    this.applyTheme();
  }

  toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    this.logger.log('Toggling theme', {
      from: currentTheme,
      to: newTheme
    });

    this.themePreference.set(newTheme);
    localStorage.setItem(this.THEME_KEY, newTheme);

    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme');
    root.classList.add(`${newTheme}-theme`);

    this.logger.log('Theme applied', {
      theme: newTheme,
      classList: root.classList.toString()
    });
  }

  resetToSystemPreference(): void {
    this.logger.log('Resetting theme to system preference');
    localStorage.removeItem(this.THEME_KEY);
    this.themePreference.set(null);
    this.applyTheme();
  }

  getCurrentTheme(): string {
    const userPreference = this.themePreference();
    return userPreference || (this.systemPrefersDark.matches ? 'dark' : 'light');
  }

  private applyTheme(): void {
    const theme = this.getCurrentTheme();
    const root = document.documentElement;
    
    root.classList.remove('light-theme', 'dark-theme');
    root.classList.add(`${theme}-theme`);
    
    this.logger.log('Theme applied', {
      theme,
      classList: root.classList.toString()
    });
  }
} 
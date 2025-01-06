import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'preferred-theme';
  private systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  // null means system preference, 'dark' or 'light' means user preference
  private themePreference = signal<string | null>(localStorage.getItem(this.THEME_KEY));

  constructor() {
    this.systemPrefersDark.addEventListener('change', this.handleSystemThemeChange.bind(this));
    this.applyTheme();
  }

  private handleSystemThemeChange(e: MediaQueryListEvent): void {
    if (this.themePreference() === null) {
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
    document.documentElement.classList.toggle('dark-theme', isDark);
  }
} 
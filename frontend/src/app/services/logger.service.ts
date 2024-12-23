import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private enableLogging = environment.enableLogging;

  log(message: string, ...args: unknown[]) {
    if (this.enableLogging) {
      console.log(message, ...args);
    }
  }

  error(message: string, ...args: unknown[]) {
    if (this.enableLogging) {
      console.error(message, ...args);
    }
  }

  warn(message: string, ...args: unknown[]) {
    if (this.enableLogging) {
      console.warn(message, ...args);
    }
  }
}

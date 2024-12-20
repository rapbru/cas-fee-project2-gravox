import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  log(message: string, data?: unknown): void {
    console.log(`[LOG]: ${message}`, data);
  }

  warn(message: string, data?: unknown): void {
    console.warn(`[WARN]: ${message}`, data);
  }

  error(message: string, data?: unknown): void {
    console.error(`[ERROR]: ${message}`, data);
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private baseUrl = environment.apiUrl;

  getUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint}`;
  }
} 
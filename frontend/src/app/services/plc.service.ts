import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { ErrorHandlingService } from './error-handling.service';
import { ApiConfigService } from './api-config.service';

interface PlcWriteResponse {
  success: boolean;
  message?: string;
}

interface PlcWriteUpdate {
  tagName: string;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlcService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private errorHandlingService: ErrorHandlingService,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.getUrl('plc');
  }

  writeValues(updates: PlcWriteUpdate[]): Observable<PlcWriteResponse> {
    return this.http.post<PlcWriteResponse>(`${this.apiUrl}/write`, updates).pipe(
      tap(() => {
        this.errorHandlingService.showSuccess('Werte erfolgreich aktualisiert');
      }),
      catchError(error => {
        this.errorHandlingService.showError('Fehler beim Aktualisieren der Werte');
        throw error;
      })
    );
  }
} 
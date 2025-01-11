import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap } from 'rxjs';
import { Position } from '../models/position.model';
import { PositionOrder } from '../models/position-order.model';
import { SnackbarService } from './snackbar.service';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class PositionOrderService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private snackbarService: SnackbarService,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.getUrl('settings/position-order');
  }

  getPositionOrder(): Observable<PositionOrder[]> {
    return this.http.get<PositionOrder[]>(this.apiUrl);
  }

  savePositionOrder(positions: number[]): Observable<void> {
    return this.http.post<void>(this.apiUrl, { positions }).pipe(
      tap(() => {
        this.snackbarService.showSuccess('Reihenfolge gespeichert');
      }),
      catchError(error => {
        this.snackbarService.showError('Fehler beim Speichern der Reihenfolge');
        throw error;
      })
    );
  }

  applyOrder(positions: Position[]): Observable<Position[]> {
    const positionsCopy = [...positions];

    return this.getPositionOrder().pipe(
      map(order => {
        const orderMap = new Map(order.map(o => [o.position_id, o.order_index]));
        
        return positionsCopy.sort((a, b) => {
          const orderA = orderMap.get(a.id) ?? Number.MAX_VALUE;
          const orderB = orderMap.get(b.id) ?? Number.MAX_VALUE;
          return orderA - orderB;
        });
      }),
    );
  }
} 
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap } from 'rxjs';
import { Position } from '../models/position.model';
import { PositionOrder } from '../models/position-order.model';
import { ErrorHandlingService } from './error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class PositionOrderService {
  private apiUrl = 'http://localhost:3001/settings/position-order';

  constructor(
    private http: HttpClient,
    private errorHandlingService: ErrorHandlingService
  ) {}

  getPositionOrder(): Observable<PositionOrder[]> {
    return this.http.get<PositionOrder[]>(this.apiUrl);
  }

  savePositionOrder(positions: number[]): Observable<void> {
    return this.http.post<void>(this.apiUrl, { positions }).pipe(
      tap(() => {
        this.errorHandlingService.showSuccess('Reihenfolge gespeichert');
      }),
      catchError(error => {
        this.errorHandlingService.showError('Fehler beim Speichern der Reihenfolge');
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
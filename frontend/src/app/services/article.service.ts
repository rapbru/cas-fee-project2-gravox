import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, Observable, of } from 'rxjs';
import { AuthService } from '../authentication/auth.service';
import { LoggerService } from './logger.service';
import { ApiConfigService } from './api-config.service';
import { Article } from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private logger: LoggerService,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.getUrl('article');
  }

  getArticles(): Observable<Article[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Article[]>(this.apiUrl, { headers }).pipe(
      tap(articles => this.logger.log('Fetched articles:', articles)),
      catchError(error => {
        this.logger.error('Error fetching articles:', error);
        return of([]);
      })
    );
  }

  deleteArticle(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(() => this.logger.log(`Deleted article with id: ${id}`)),
      catchError(error => {
        this.logger.error('Error deleting article:', error);
        throw error;
      })
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const authToken = this.authService.getToken();
    if (!authToken) {
      throw new Error('Authorization token missing');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
  }
}

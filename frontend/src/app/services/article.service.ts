import { Injectable, Signal, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, Observable, of } from 'rxjs';
import { AuthService } from '../authentication/auth.service';
import { LoggerService } from './logger.service';
import { ApiConfigService } from './api-config.service';
import { Article } from '../models/article.model';
import { environment } from '../../environments/environment';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl: string;
  private modifiedArticles: Set<Article> = new Set();
  private currentArticle: Article | null = null;
  private isLoading = signal(false);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private logger: LoggerService,
    private apiConfig: ApiConfigService,
    private snackbarService: SnackbarService
  ) {
    this.apiUrl = this.apiConfig.getUrl('article');
  }

  trackModification(article: Article): void {
    this.modifiedArticles.add(article);
    this.logger.log('Tracked modification for article:', article);
  }

  saveModifications(): Observable<any> {
    const updates = Array.from(this.modifiedArticles).map(article => 
      this.updateArticle(article)
    );
    
    this.modifiedArticles.clear();
    
    return new Observable(subscriber => {
      Promise.all(updates.map(obs => obs.toPromise()))
        .then(() => {
          this.logger.log('Saved all article modifications');
          subscriber.next();
          subscriber.complete();
        })
        .catch(error => {
          this.logger.error('Error saving article modifications:', error);
          subscriber.error(error);
        });
    });
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

  updateArticle(article: Article): Observable<Article> {
    const headers = this.getAuthHeaders();
    return this.http.put<Article>(`${this.apiUrl}/${article.id}`, article, { headers }).pipe(
      tap(updatedArticle => this.logger.log('Updated article:', updatedArticle)),
      catchError(error => {
        this.logger.error('Error updating article:', error);
        throw error;
      })
    );
  }

  setCurrentArticle(article: Article) {
    this.currentArticle = article;
  }

  getCurrentArticle(): Article | null {
    return this.currentArticle;
  }

  loadArticleToPlc(articleId: number): void {
    this.isLoading.set(true);
    this.http.post<{message: string}>(`${environment.apiUrl}/plc/load/${articleId}`, {}).pipe(
      tap((response) => {
        this.snackbarService.showSuccess(response.message);
        this.isLoading.set(false);
      }),
      catchError(error => {
        const errorMessage = error.error?.error || 'Fehler beim Laden des Artikels';
        this.snackbarService.showError(errorMessage, error);
        this.isLoading.set(false);
        throw error;
      })
    ).subscribe();
  }

  getIsLoading(): Signal<boolean> {
    return this.isLoading.asReadonly();
  }

  private getAuthHeaders(): HttpHeaders {
    const authToken = this.authService.getToken();
    if (!authToken) {
      throw new Error('Authorization token missing');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
  }
}

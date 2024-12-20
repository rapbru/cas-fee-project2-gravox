import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../authentication/auth.service';
import { LoggerService } from './logger.service';
import { ApiConfigService } from '../services/api-config.service';

interface Article {
  id: number;
  title: string;
  content: string;
}

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

  public fetchArticles() {
    const authToken = this.authService.getToken();

    if (!authToken) {
      console.error('Authorization token missing');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);

    this.http.get<Article[]>(this.apiUrl, { headers }).pipe(
      tap(response => {
        this.logger.log('Fetched Articles:', response);
      }),
      catchError(error => {
        console.error('Error fetching articles:', error);
        return of([]);
      })
    ).subscribe();
  }
}

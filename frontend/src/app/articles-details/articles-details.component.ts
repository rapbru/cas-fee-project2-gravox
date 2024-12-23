import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Article } from '../models/article.model';
import { environment } from '../../environments/environment';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'app-articles-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
  ],
  templateUrl: './articles-details.component.html',
  styleUrls: ['./articles-details.component.scss']
})
export class ArticlesDetailsComponent implements OnInit {

  articleId: string | null = null;
  article: Article | null = null;
  private enableLogging = environment.enableLogging;

  constructor(private route: ActivatedRoute, private http: HttpClient, private loggerService: LoggerService) {}

  ngOnInit(): void {
    this.articleId = this.route.snapshot.paramMap.get('id');

    if (this.articleId) {
      this.loadArticle(this.articleId);
    }
  }

  loadArticle(id: string) {
    this.http.get<Article>(`${environment.apiUrl}/articles/${id}`)
      .subscribe({
        next: (article) => {
          this.article = article;
          if (this.enableLogging) {
            this.loggerService.log('Article loaded successfully:', article);
          }
        },
        error: (error) => {
          if (this.enableLogging) {
            this.loggerService.error('Error loading article:', error);
          }
        }
      });
  }
}

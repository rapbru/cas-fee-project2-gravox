import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Article } from '../models/article.model';
import { LoggerService } from '../services/logger.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ArticleCardComponent } from '../article-card/article-card.component';

@Component({
  selector: 'app-articles-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ArticleCardComponent
  ],
  templateUrl: './articles-details.component.html',
  styleUrls: ['./articles-details.component.scss']
})
export class ArticlesDetailsComponent implements OnInit {
  private enableLogging = environment.enableLogging;
  article?: Article;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private loggerService: LoggerService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadArticleDetails(id);
      }
    });

    // Scroll to top when component initializes
    window.scrollTo(0, 0);
  }

  private loadArticleDetails(id: string) {
    this.http.get<Article>(`${environment.apiUrl}/article/${id}`)
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

  public loadArticle() {
    console.log('Loading article:', this.article);
  }
}

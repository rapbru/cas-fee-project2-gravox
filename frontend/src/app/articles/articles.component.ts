import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoggerService } from '../services/logger.service';
import { environment } from '../../environments/environment';
import { Article } from '../models/article.model';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ToolbarComponent } from '../toolbar/toolbar.component';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatCheckboxModule,
    FormsModule,
    MatButtonModule,
    ToolbarComponent
  ],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {
  private enableLogging = environment.enableLogging;
  articles: Article[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private loggerService: LoggerService
  ) {}

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.http.get<Article[]>(`${environment.apiUrl}/article`)
      .subscribe({
        next: (articles) => {
          this.articles = articles;
          if (this.enableLogging) {
            this.loggerService.log('Articles loaded successfully:', articles);
          }
        },
        error: (error) => {
          if (this.enableLogging) {
            this.loggerService.error('Error loading articles:', error);
          }
        }
      });
  }

  navigateToDetails(id: string | number | undefined) {
    if (id !== undefined) {
      this.router.navigate(['/articles', id.toString()]);
    } else {
      if (this.enableLogging) {
        this.loggerService.error('Cannot navigate: Article ID is undefined');
      }
    }
  }

  hasSelectedArticles(): boolean {
    return this.articles.some(article => article.selected);
  }

  hasExactlyOneSelected(): boolean {
    return this.articles.filter(article => article.selected).length === 1;
  }

  loadSelectedArticle(): void {
    const selectedArticle = this.articles.find(article => article.selected);
    if (selectedArticle?.id) {
      this.navigateToDetails(selectedArticle.id);
    }
  }

  deleteSelectedArticles() {
    // TODO: Implement deletion logic
    if (this.enableLogging) {
      this.loggerService.log('Delete action triggered for selected articles');
    }
  }
}


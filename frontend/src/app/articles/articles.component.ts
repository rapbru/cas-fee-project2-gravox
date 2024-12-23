import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { DeviceDetectionService } from '../services/device-detection.service';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoggerService } from '../services/logger.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../environments/environment';
import { Article } from '../models/article.model';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    CommonModule, 
    ToolbarComponent, 
    MatCardModule,
    MatCheckboxModule,
    FormsModule,
    MatButtonModule,
  ],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss'],
  template: `
    <div *ngIf="articles.length">
      <div *ngFor="let article of articles">
        <h2>{{article.title}}</h2>
        <p>{{article.content}}</p>
      </div>
    </div>
    <div *ngIf="error">{{error}}</div>
    <div *ngIf="loading">Loading...</div>
  `
})
export class ArticlesComponent implements OnInit {
  private enableLogging = environment.enableLogging;
  articles: Article[] = [];
  error = '';
  loading = true;

  constructor(
    private deviceDetectionService: DeviceDetectionService,
    private http: HttpClient,
    private router: Router,
    private loggerService: LoggerService
  ) {}

  ngOnInit() {
    this.loadArticles();
  }

  public loadArticles() {
    this.http.get<Article[]>(`${environment.apiUrl}/article`)
      .subscribe({
        next: (articles) => {
          console.log('Raw API response:', articles);
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

  public navigateToDetails(id: string | number | undefined) {
    if (id !== undefined) {
      this.router.navigate(['/articles', id.toString()]);
    } else {
      if (this.enableLogging) {
        this.loggerService.error('Cannot navigate: Article ID is undefined');
      }
    }
  }

  // isMobile(): boolean {
  //   return this.deviceDetectionService.isMobileSignal();
  // }

  public hasSelectedArticles(): boolean {
    return this.articles.some(article => article.selected);
  }

  public deleteSelectedArticles() {
    const selectedArticles = this.articles.filter(article => article.selected);
    this.loggerService.log('Deleting articles:', selectedArticles);
    
    // Add confirmation dialog if needed
    if (confirm(`Are you sure you want to delete ${selectedArticles.length} articles?`)) {
      // Implement deletion logic here
      selectedArticles.forEach(article => {
        this.http.delete(`${environment.apiUrl}/article/${article.id}`)
          .subscribe({
            next: () => {
              this.loggerService.log(`Article ${article.id} deleted successfully`);
              this.loadArticles(); // Reload the list after deletion
            },
            error: (err) => {
              this.loggerService.error(`Error deleting article ${article.id}:`, err);
            }
          });
      });
    }
  }
}

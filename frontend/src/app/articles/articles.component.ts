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


export interface Article {
  id: string;
  title: { value: string };
  number: { value: string };
  customer: { value: string };
  area: { value: string };
  drainage: { value: string };
  anodic: { value: string };
  createdBy: { value: string };
  createdDate?: string;
  note: { value: string };
  sequence?: SequenceItem[];
  modifiedBy?: { value: string };
  modifiedDate?: string;
  selected?: boolean;
}

interface SequenceItem {
  positionId: number;
  orderNumber: number;
  timePreset: number;
  currentPreset: number;
  voltagePreset: number | null;
}


@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    CommonModule, 
    ToolbarComponent, 
    MatCardModule,
    MatCheckboxModule,
    FormsModule,
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
    this.http.get<Article[]>('http://localhost:3001/article')
      .subscribe({
        next: (data) => {
          this.loggerService.log('Articles loaded successfully:', data);
          this.articles = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load articles';
          this.loading = false;
          this.loggerService.error('Error loading articles:', err);
        }
      });
  }

  public navigateToDetails(articleId: string) {
    this.router.navigate(['/articles', articleId]);
  }

  // isMobile(): boolean {
  //   return this.deviceDetectionService.isMobileSignal();
  // }
}

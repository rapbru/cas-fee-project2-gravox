import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { DeviceDetectionService } from '../services/device-detection.service';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoggerService } from '../services/logger.service';


export interface Article {
  id: string;
  title: { id: string; value: string };
  area: { id: string; value: string };
  drainage: { id: string; value: string };
  anodic: { id: string; value: string };
  note: { id: string; value: string };
  createdBy: { id: string; value: string };
  createdDate: { id: string; value: string };
  modifiedBy: { id: string; value: string };
  modifiedDate: { id: string; value: string };
  number: { id: string; value: string };
  customer: { id: string; value: string };
}



@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, ToolbarComponent, MatCardModule],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {
  articles: Article[] = [];

  constructor(
    private deviceDetectionService: DeviceDetectionService,
    private http: HttpClient,
    private router: Router,
    private loggerService: LoggerService
  ) {}


  ngOnInit(): void {
    this.loadArticles();
  }

  // loadArticles(): void {
  //   this.http.get<{ articles: Article[] }>('assets/articles-data.json').subscribe({
  //     next: (data) => {
  //       this.articles = data.articles;
  //       this.loggerService.log('Articles loaded successfully:', this.articles); // Log the data
  //     },
  //     error: (err) => {
  //       console.error('Error loading articles:', err);
  //       this.loggerService.error('Error loading articles:', err); // Log the error
  //     }
  //   });
  // }


  loadArticles(): void {
    this.http.get<{ articles: Article[] }>('http://localhost:3001/articles').subscribe({
      next: (data) => {
        this.articles = data.articles;
        this.loggerService.log('Articles loaded successfully:', this.articles);
      },
      error: (err) => {
        console.error('Error loading articles:', err);
        this.loggerService.error('Error loading articles:', err);
      }
    });
  }

  navigateToDetails(articleId: string) {
    this.router.navigate(['/articles', articleId]);
  }

  isMobile(): boolean {
    return this.deviceDetectionService.isMobileSignal();
  }
}

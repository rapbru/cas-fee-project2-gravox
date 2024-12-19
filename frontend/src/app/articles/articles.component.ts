import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { DeviceDetectionService } from '../services/device-detection.service';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';



export interface ArticleField {
  id: string;
  value: string;
}

export interface Article {
  id: string;
  title: ArticleField;
  number: ArticleField;
  customer: ArticleField;
  area: ArticleField;
  drainage: ArticleField;
  anodic: ArticleField;
  createdBy: ArticleField;
  createdDate: ArticleField;
  modifiedBy: ArticleField;
  modifiedDate: ArticleField;
  note: ArticleField;
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
    private router: Router
  ) {}

  navigateToDetails(articleId: string) {
    this.router.navigate(['/articles', articleId]);
  }

  ngOnInit(): void {
    this.http.get<{ articles: Article[] }>('/assets/articles-data.json').subscribe((data) => {
      this.articles = data.articles;

      this.articles.forEach((article) => {
        const articleId = article.id;
        article.title.id = `article-title-${articleId}`;
        article.number.id = `article-number-${articleId}`;
        article.customer.id = `article-customer-${articleId}`;
        article.area.id = `article-area-${articleId}`;
        article.drainage.id = `article-drainage-${articleId}`;
        article.anodic.id = `article-anodic-${articleId}`;
        article.createdBy.id = `article-createdBy-${articleId}`;
        article.createdDate.id = `article-createdDate-${articleId}`;
        article.modifiedBy.id = `article-modifiedBy-${articleId}`;
        article.modifiedDate.id = `article-modifiedDate-${articleId}`;
        article.note.id = `article-note-${articleId}`;
      });
    });
  }

  isMobile(): boolean {
    return this.deviceDetectionService.isMobileSignal();
  }
}

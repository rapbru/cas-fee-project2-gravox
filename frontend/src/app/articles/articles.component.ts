import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { DeviceDetectionService } from '../services/device-detection.service';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
// import { HttpClientModule } from '@angular/common/http';

interface ArticleField {
  id: string;
  value: string;
}

interface Article {
  id: string;
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
  article: Article | null = null;

  constructor(
    private deviceDetectionService: DeviceDetectionService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.http.get<{ article: Article }>('/assets/articles-data.json').subscribe((data) => {
      this.article = data.article;

      if (this.article) {
        const articleId = this.article.id;
        this.article.number.id = `article-number-${articleId}`;
        this.article.customer.id = `article-customer-${articleId}`;
        this.article.area.id = `article-area-${articleId}`;
        this.article.drainage.id = `article-drainage-${articleId}`;
        this.article.anodic.id = `article-anodic-${articleId}`;
        this.article.createdBy.id = `article-createdBy-${articleId}`;
        this.article.createdDate.id = `article-createdDate-${articleId}`;
        this.article.modifiedBy.id = `article-modifiedBy-${articleId}`;
        this.article.modifiedDate.id = `article-modifiedDate-${articleId}`;
        this.article.note.id = `article-note-${articleId}`;
      }
    });
  }

  isMobile(): boolean {
    return this.deviceDetectionService.isMobileSignal();
  }
}

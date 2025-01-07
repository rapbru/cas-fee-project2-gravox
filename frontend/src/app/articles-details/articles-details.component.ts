import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Article } from '../models/article.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { OverviewStateService } from '../services/overview-state.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ArticleCardComponent } from '../article-card/article-card.component';
import { HeaderService } from '../services/header.service';

@Component({
  selector: 'app-articles-details',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ArticleCardComponent
  ],
  templateUrl: './articles-details.component.html',
  styleUrls: ['./articles-details.component.scss']
})
export class ArticlesDetailsComponent implements OnInit {
  article: Article | null = null;
  public readonly enableEdit = this.overviewStateService.enableEdit;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private overviewStateService: OverviewStateService,
    private headerService: HeaderService
  ) {}

  ngOnInit() {
    this.loadArticle();
  }

  private loadArticle() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<Article>(`${environment.apiUrl}/article/${id}`)
        .subscribe({
          next: (article) => {
            this.article = article;
            this.headerService.setTitle(article.title);
          },
          error: (error) => {
            console.error('Error loading article:', error);
          }
        });
    }
  }

  onLoad() {
    // Existing load functionality
  }

  onSave() {
    // Save changes
    this.overviewStateService.toggleEdit();
  }

  onCancel() {
    // Cancel changes
    this.overviewStateService.toggleEdit();
  }
}

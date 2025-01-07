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
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-articles-details',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ArticleCardComponent,
    DragDropModule
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
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.getArticle(id);
      }
    });

    window.scrollTo(0, 0);
  }

  private getArticle(id: string) {
    this.http.get<Article>(`${environment.apiUrl}/article/${id}`)
      .subscribe({
        next: (article) => {
          this.article = article;
          console.log('Article loaded successfully:', article);
        },
        error: (error) => {
          console.error('Error loading article:', error);
        }
      });
  }

  public onLoad() {
    if (this.article) {
      this.http.post(`${environment.apiUrl}/article/${this.article.id}/load`, {})
        .subscribe({
          next: () => {
            console.log('Article loaded to PLC successfully');
          },
          error: (error) => {
            console.error('Error loading article to PLC:', error);
          }
        });
    }
  }

  onDrop(event: CdkDragDrop<any[]>) {
    if (this.article?.sequence) {
      moveItemInArray(
        this.article.sequence,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}

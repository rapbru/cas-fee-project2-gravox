import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { SequenceCardComponent } from '../sequence-card/sequence-card.component';
import { ArticleService } from '../services/article.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-articles-details',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ArticleCardComponent,
    DragDropModule,
    SequenceCardComponent
  ],
  templateUrl: './articles-details.component.html',
  styleUrls: ['./articles-details.component.scss']
})
export class ArticlesDetailsComponent implements OnInit, OnDestroy {
  article: Article | null = null;
  public readonly enableEdit = this.overviewStateService.enableEdit;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private overviewStateService: OverviewStateService,
    private headerService: HeaderService,
    private articleService: ArticleService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.getArticle(id);
      }
    });
  }

  ngOnDestroy() {
    // Reset header when leaving the component
    this.headerService.setTitle('');
  }

  private getArticle(id: string) {
    console.log('Fetching article:', id);
    this.http.get<Article>(`${environment.apiUrl}/article/${id}`)
      .subscribe({
        next: (article) => {
          console.log('Article loaded:', article);
          this.article = article;
          // Update header with article title
          this.updateHeader();
        },
        error: (error) => {
          console.error('Error loading article:', error);
        }
      });
  }

  private updateHeader() {
    if (this.article) {
      this.headerService.setTitle(this.article.title);
    }
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
      const originalArticle = JSON.parse(JSON.stringify(this.article));
      const articleId = this.article.id;

      moveItemInArray(
        this.article.sequence,
        event.previousIndex,
        event.currentIndex
      );

      this.article.sequence = this.article.sequence.map((seq, index) => ({
        ...seq,
        orderNumber: index + 1
      }));

      console.log('Sending updated article:', this.article);

      this.articleService.updateArticle(this.article)
        .pipe(
          finalize(() => {
            if (articleId) {
              console.log('Refreshing article data');
              this.getArticle(articleId.toString());
            }
          })
        )
        .subscribe({
          next: () => {
            console.log('Update successful');
          },
          error: (error) => {
            console.error('Error updating sequence order:', error);
            this.article = originalArticle;
            this.updateHeader(); // Update header if we revert to original
          }
        });
    }
  }
}

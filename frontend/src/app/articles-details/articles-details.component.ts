import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Article } from '../models/article.model';
import { Position } from '../models/position.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { OverviewStateService } from '../services/overview-state.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ArticleCardComponent } from '../article-card/article-card.component';
import { PositionCardComponent } from '../position/position-card/position-card.component';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PositionService } from '../services/position.service';
import { HeaderService } from '../services/header.service';
import { ArticleService } from '../services/article.service';
import { LoggerService } from '../services/logger.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-articles-details',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ArticleCardComponent,
    PositionCardComponent,
    DragDropModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './articles-details.component.html',
  styleUrls: ['./articles-details.component.scss']
})
export class ArticlesDetailsComponent implements OnInit, OnDestroy {
  article: Article | null = null;
  positions: Position[] = [];
  public readonly enableEdit = this.overviewStateService.enableEdit;
  isLoading = this.articleService.getIsLoading();

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private overviewStateService: OverviewStateService,
    private headerService: HeaderService,
    private articleService: ArticleService,
    private positionService: PositionService,
    private logger: LoggerService
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
    this.headerService.setTitle('');
  }

  private getArticle(id: string) {
    this.logger.log('Fetching article:', id);
    this.http.get<Article>(`${environment.apiUrl}/article/${id}`)
      .subscribe({
        next: async (article) => {
          this.logger.log('Received article:', article);
          this.logger.log('Article sequence:', article.sequence);
          this.article = article;
          await this.loadPositions();
          this.updateHeader();
        },
        error: (error: Error) => {
          this.logger.error('Error loading article:', error);
        }
      });
  }

  private async loadPositions() {
    if (!this.article?.sequence) {
      this.logger.log('No sequence data found');
      return;
    }
    
    try {
      // Get all positions from the service
      const allPositions = await firstValueFrom(this.positionService.positions$);
      this.logger.log('All positions from service:', allPositions);
      this.logger.log('Article sequence:', this.article.sequence);
      
      // Create a temporary array to hold valid positions
      const validPositions: Position[] = [];
      
      // Sort sequences by order number and process each one
      this.article.sequence
        .sort((a, b) => a.orderNumber - b.orderNumber)
        .forEach(seq => {
          this.logger.log('Processing sequence:', seq);
          // Find position by number instead of id
          const position = allPositions.find(p => p.number === Number(seq.positionId));
          this.logger.log('Found position:', position);
          
          if (position) {
            const mappedPosition = {
              ...position,
              timePreset: Number(seq.timePreset) || 0,
              currentPreset: Number(seq.currentPreset) || 0,
              voltagePreset: Number(seq.voltagePreset) || 0
            };
            this.logger.log('Mapped position:', mappedPosition);
            validPositions.push(mappedPosition);
          } else {
            // Create a new position if not found in allPositions
            const newPosition: Position = {
              id: Number(seq.positionId),
              number: Number(seq.positionId),
              name: `Position ${seq.positionId}`,
              time: { actual: 0, preset: Number(seq.timePreset) || 0 },
              temperature: { actual: 0, preset: 0, isPresent: false },
              current: { actual: 0, preset: Number(seq.currentPreset) || 0, isPresent: true },
              voltage: { actual: 0, preset: Number(seq.voltagePreset) || 0, isPresent: true },
              timePreset: Number(seq.timePreset) || 0,
              currentPreset: Number(seq.currentPreset) || 0,
              voltagePreset: Number(seq.voltagePreset) || 0
            };
            this.logger.log('Created new position:', newPosition);
            validPositions.push(newPosition);
          }
        });
      
      // Assign the valid positions to the component property
      this.positions = validPositions;
      this.logger.log('Final positions array:', this.positions);
    } catch (error) {
      this.logger.error('Error loading positions:', error);
      this.positions = [];
    }
  }

  private updateHeader() {
    if (this.article) {
      this.headerService.setTitle(this.article.title);
    }
  }

  public onLoad() {
    if (this.article?.id) {
      this.articleService.loadArticleToPlc(this.article.id);
    }
  }

  onDrop(event: CdkDragDrop<Position[]>) {
    if (this.article?.sequence && this.positions.length > 0) {
      const originalArticle = JSON.parse(JSON.stringify(this.article));
      const articleId = this.article.id;

      moveItemInArray(
        this.positions,
        event.previousIndex,
        event.currentIndex
      );

      // Update sequence order numbers
      this.article.sequence = this.positions.map((pos, index) => ({
        positionId: pos.id.toString(),
        orderNumber: index + 1,
        timePreset: (pos.timePreset ?? 0).toString(),
        currentPreset: (pos.currentPreset ?? 0).toString(),
        voltagePreset: (pos.voltagePreset ?? 0).toString()
      }));

      this.articleService.updateArticle(this.article)
        .subscribe({
          next: () => {
            this.logger.log('Update successful');
            if (articleId) {
              this.getArticle(articleId.toString());
            }
          },
          error: (error: Error) => {
            this.logger.error('Error updating sequence order:', error);
            this.article = originalArticle;
            this.updateHeader();
          }
        });
    }
  }
}

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { CommonModule } from '@angular/common';
import { PositionSequenceComponent } from '../position/position-sequence/position-sequence.component';
import { Sequence } from '../models/sequence.model';
import { Sequence as ArticleSequence } from '../models/article.model';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-articles-details',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    ArticleCardComponent,
    DragDropModule,
    MatProgressSpinnerModule,
    PositionSequenceComponent,
    FooterComponent
  ],
  templateUrl: './articles-details.component.html',
  styleUrls: ['./articles-details.component.scss']
})
export class ArticlesDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('positionSequence') positionSequence?: PositionSequenceComponent;
  
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
      const allPositions = this.positionService.positions();
      this.logger.log('All positions from service:', allPositions);
      this.logger.log('Article sequence:', this.article.sequence);
      
      const validPositions: Position[] = [];
      
      this.article.sequence
        .sort((a, b) => a.orderNumber - b.orderNumber)
        .forEach((seq: ArticleSequence) => {
          this.logger.log('Processing sequence:', seq);
          const position = allPositions.find(p => p.number === Number(seq.positionId));
          this.logger.log('Found position:', position);
          
          if (position) {
            const mappedPosition = {
              ...position,
              timePreset: Number(seq.timePreset) || 0,
              currentPreset: Number(seq.currentPreset) || 0,
              voltagePreset: Number(seq.voltagePreset) || 0,
              name: seq.positionName || position.name,
              voltage: {
                ...position.voltage,
                preset: Number(seq.voltagePreset) || 0,
                isPresent: position.voltage.isPresent
              },
              current: {
                ...position.current,
                preset: Number(seq.currentPreset) || 0,
                isPresent: position.current.isPresent
              }
            };
            this.logger.log('Mapped position:', mappedPosition);
            validPositions.push(mappedPosition);
          } else {
            const newPosition: Position = {
              id: Number(seq.positionId),
              number: Number(seq.positionId),
              name: seq.positionName || `Position ${seq.positionId}`,
              time: { actual: 0, preset: Number(seq.timePreset) || 0 },
              temperature: { actual: 0, preset: 0, isPresent: false },
              current: { actual: 0, preset: Number(seq.currentPreset) || 0, isPresent: false },
              voltage: { actual: 0, preset: Number(seq.voltagePreset) || 0, isPresent: false },
              timePreset: Number(seq.timePreset) || 0,
              currentPreset: Number(seq.currentPreset) || 0,
              voltagePreset: Number(seq.voltagePreset) || 0
            };
            this.logger.log('Created new position:', newPosition);
            validPositions.push(newPosition);
          }
        });
      
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

  onSequenceChange(sequences: Sequence[]) {
    if (!this.article) return;
    
    const articleSequences = sequences.map(seq => ({
      ...seq,
      timePreset: seq.timePreset?.toString() ?? '0',
      currentPreset: seq.currentPreset?.toString() ?? '0',
      voltagePreset: seq.voltagePreset?.toString() ?? '0'
    }));
    
    const updatedArticle = {
      ...this.article,
      sequence: articleSequences
    };
    
    this.articleService.trackModification(updatedArticle);
    this.article = updatedArticle;
  }

  openPositionSelector() {
    if (this.positionSequence) {
      this.positionSequence.openPositionSelector();
    }
  }

  isEditEnabled(): boolean {
    return this.enableEdit();
  }
}

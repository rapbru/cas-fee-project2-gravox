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
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PositionService } from '../services/position.service';
import { HeaderService } from '../services/header.service';
import { ArticleService } from '../services/article.service';
import { LoggerService } from '../services/logger.service';
import { CommonModule } from '@angular/common';
import { PositionSequenceComponent } from '../position/position-sequence/position-sequence.component';
import { Sequence } from '../models/sequence.model';
import { FooterComponent } from '../footer/footer.component';
import { SnackbarService } from '../services/snackbar.service';

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
    private logger: LoggerService,
    private snackbarService: SnackbarService
  ) {
    this.headerService.setTitle('Artikeldetails');
  }

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
        .forEach((seq: Sequence) => {
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

  public onLoad() {
    if (this.article?.id) {
      this.articleService.loadArticleToPlc(this.article.id);
    }
  }

  onDrop(event: CdkDragDrop<Position[]>) {
    if (!this.article?.sequence || !this.positions.length) return;

    moveItemInArray(this.positions, event.previousIndex, event.currentIndex);

    const sequences: Sequence[] = this.positions.map((position, index) => ({
      positionId: position.id.toString(),
      orderNumber: index + 1,
      timePreset: parseFloat(position.timePreset?.toString() || '0'),
      currentPreset: parseFloat(position.currentPreset?.toString() || '0'),
      voltagePreset: parseFloat(position.voltagePreset?.toString() || '0'),
      positionName: position.name
    }));

    if (this.article.id) {
      this.articleService.updateSequenceOrder(this.article, sequences).subscribe({
        next: (updatedArticle) => {
          this.article = updatedArticle;
        },
        error: (error) => {
          moveItemInArray(this.positions, event.currentIndex, event.previousIndex);
          this.snackbarService.showError('Fehler beim Speichern der Reihenfolge');
        }
      });
    }
  }

  onSequenceChange(sequences: Sequence[]) {
    if (!this.article?.id) {
      this.logger.warn('Versuch Sequenz ohne Artikel-ID zu aktualisieren');
      return;
    }
    
    const articleId = this.article.id;
    
    const updatedSequence: Sequence[] = sequences.map(seq => ({
      ...seq,
      articleId,
      timePreset: Number(seq.timePreset),
      currentPreset: Number(seq.currentPreset),
      voltagePreset: Number(seq.voltagePreset),
      positionId: seq.positionId,
      orderNumber: seq.orderNumber,
      positionName: seq.positionName
    }));
    
    const updatedArticle: Article = {
      ...this.article,
      id: articleId,
      sequence: updatedSequence
    };

    this.articleService.trackModification(updatedArticle);
    
    this.articleService.updateSequenceOrder(updatedArticle, updatedSequence).subscribe({
      next: (response) => {
        this.article = {
          ...response,
          id: articleId
        };
      },
      error: (error) => {
        this.snackbarService.showError('Fehler beim Speichern der Sequenz');
      }
    });
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

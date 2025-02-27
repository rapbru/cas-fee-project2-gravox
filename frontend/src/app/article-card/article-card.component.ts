import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Article } from '../models/article.model';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ArticleService } from '../services/article.service';
import { HeaderService } from '../services/header.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InputFieldComponent } from '../input-field/input-field.component';
import { OverviewStateService } from '../services/overview-state.service';
import { SnackbarService } from '../services/snackbar.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule, 
    MatProgressSpinnerModule,
    InputFieldComponent,
    MatTooltipModule
  ],
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.scss'],
  host: {
    '[attr.isInDetails]': 'isInDetails',
    '[attr.isEditable]': 'isEditable'
  }
})
export class ArticleCardComponent implements OnInit, OnDestroy {
  @Input() article!: Article;
  @Input() showHeader: boolean = true;
  @Input() showCheckbox: boolean = true;
  @Input() isEditable: boolean = false;
  @Input() isLoadButtonDisabled: boolean = false;
  @Input() isInDetails: boolean = false;
  @Output() selectionChange = new EventEmitter<boolean>();
  @Output() cardClick = new EventEmitter<number>();

  isLoading = this.articleService.getIsLoading();

  maxLengthName = 30;
  maxLengthNumber = 6;
  maxLengthCustomer = 30;
  maxLengthArea = 4;
  maxLengthDrainage = 3;
  maxLengthNote = 120;

  private changes$ = new Subject<void>();
  isSelected = false;

  private _articleCopy?: Article;

  readonly translations = {
    article: {
      aria: {
        card: 'Artikel {title}: Details anzeigen',
        loadButton: 'Artikel {title} laden',
        select: {
          select: 'Artikel auswählen',
          deselect: 'Artikel abwählen'
        }
      },
      tooltips: {
        card: 'Artikel Details anzeigen',
        loadButton: 'Artikel laden',
        select: {
          select: 'Artikel auswählen',
          deselect: 'Artikel abwählen'
        }
      }
    }
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private articleService: ArticleService,
    private headerService: HeaderService,
    private overviewStateService: OverviewStateService,
    private snackbarService: SnackbarService,
    private logger: LoggerService
  ) {}

  toggleSelection(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isSelected = !this.isSelected;
    this.selectionChange.emit(this.isSelected);
  }

  onCardClick() {
    if (this.article) {
      this.cardClick.emit(this.article.id);
    }
  }

  onCheckboxClick(event: Event): void {
    this.toggleSelection(event);
  }

  onLoad() {
    if (this.article?.id) {
      this.articleService.loadArticleToPlc(this.article.id);
    }
  }

  editArticle() {
    if (this.article) {
      this.router.navigate(['/articles', this.article.id]);
    }
  }

  updateArticleInfo(value: any, field: keyof Article) {
    if (!this.article) return;

    if (field === 'number' || field === 'area' || field === 'drainage' || field === 'anodic') {
      (this.article[field] as number) = Number(value);
    } else {
      (this.article[field] as any) = value;
    }

    if (!this.article.id) return;

    const updatedArticle: Article = { 
      ...this.article,
      modifiedBy: 'system'
    };

    this.articleService.updateArticle(updatedArticle).subscribe({
      next: () => {
        this.logger.log(`Updated article ${field}`);
      },
      error: (error) => {
        this.logger.error(`Error updating article ${field}:`, error);
        if (field in this.article) {
          (this.article as any)[field] = (this.article as any)[field];
        }
      }
    });
  }

  private async saveChanges() {
    try {
      await this.articleService.updateArticle(this.article).toPromise();
      this.snackbarService.showSuccess('Änderungen gespeichert');
    } catch (error) {
      this.snackbarService.showError('Fehler beim Speichern', error);
    }
  }

  ngOnInit() {
    this._articleCopy = JSON.parse(JSON.stringify(this.article));
  }

  ngOnDestroy() {
    this.changes$.complete();
  }

  selectInputContent(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  formatValue(value: number | undefined, field: string): string {
    if (value === undefined) return '';
    
    switch (field) {
      case 'area':
        return `${value} dm²`;
      case 'drainage':
      case 'anodic':
        return `${value} %`;
      default:
        return value.toString();
    }
  }

  formatDate(dateValue: string | Date | undefined): string {
    if (!dateValue) return '';
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getArticleValue(field: keyof Article): any {
    if (this.article && this.article[field] !== undefined) {
      return this.article[field];
    }
    if (this._articleCopy && this._articleCopy[field] !== undefined) {
      return this._articleCopy[field];
    }
    return '';
  }
}

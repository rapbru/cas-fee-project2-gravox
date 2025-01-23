import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Article } from '../models/article.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
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
    InputFieldComponent
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

  constructor(
    private router: Router,
    private http: HttpClient,
    private articleService: ArticleService,
    private headerService: HeaderService,
    private overviewStateService: OverviewStateService,
    private snackbarService: SnackbarService
  ) {}

  toggleSelection(): void {
    this.isSelected = !this.isSelected;
    this.selectionChange.emit(this.isSelected);
  }

  onCardClick() {
    if (this.article) {
      this.cardClick.emit(this.article.id);
    }
  }

  onCheckboxClick(event: Event): void {
    event.stopPropagation();
    this.toggleSelection();
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

  updateArticleInfo(event: any, field: string) {
    if (this.article) {
      this.article = {
        ...this.article,
        [field]: event
      };
      
      this.articleService.trackModification(this.article);
      this.changes$.next();
    }
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
    // Remove effect from here
  }

  ngOnDestroy() {
    this.changes$.complete();
  }

  selectInputContent(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  formatValue(value: string | undefined, field: string): string {
    if (!value) return '';
    
    switch (field) {
      case 'area':
        return `${value} dm²`;
      case 'drainage':
      case 'anodic':
        return `${value} %`;
      default:
        return value;
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
}

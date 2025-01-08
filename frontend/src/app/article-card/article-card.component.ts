import { Component, Input, Output, EventEmitter } from '@angular/core';
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

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.scss'],
  host: {
    '[attr.isInDetails]': 'isInDetails',
    '[attr.isEditable]': 'isEditable'
  }
})
export class ArticleCardComponent {
  @Input() article!: Article;
  @Input() showHeader: boolean = true;
  @Input() showCheckbox: boolean = false;
  @Input() isSelected: boolean = false;
  @Input() isEditable: boolean = false;
  @Input() isLoadButtonDisabled: boolean = false;
  @Input() isInDetails: boolean = false;
  @Output() selectionChange = new EventEmitter<boolean>();
  @Output() cardClick = new EventEmitter<number>();

  constructor(
    private router: Router,
    private http: HttpClient,
    private articleService: ArticleService,
    private headerService: HeaderService
  ) {}

  onCardClick() {
    if (this.article) {
      this.cardClick.emit(this.article.id);
    }
  }

  onCheckboxChange(event: any) {
    this.isSelected = event.checked;
    this.selectionChange.emit(this.isSelected);
  }

  onLoad() {
    if (this.article?.id) {
      this.articleService.loadArticleToPlc(this.article.id)
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

  editArticle() {
    if (this.article) {
      this.router.navigate(['/articles', this.article.id]);
    }
  }

  updateArticleInfo(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    let newValue = inputElement.value;

    // Strip units from values before saving
    switch (field) {
      case 'area':
        newValue = newValue.replace(/\s*dm2\s*$/i, '').trim();
        break;
      case 'drainage':
      case 'anodic':
        newValue = newValue.replace(/\s*%\s*$/i, '').trim();
        break;
    }

    const updatedArticle = { ...this.article };
    
    switch (field) {
      case 'title':
        updatedArticle.title = newValue;
        this.headerService.setTitle(newValue);
        break;
      case 'number':
        updatedArticle.number = newValue;
        break;
      case 'customer':
        updatedArticle.customer = newValue;
        break;
      case 'area':
        updatedArticle.area = newValue;
        break;
      case 'drainage':
        updatedArticle.drainage = newValue;
        break;
      case 'anodic':
        updatedArticle.anodic = newValue;
        break;
      case 'note':
        updatedArticle.note = newValue;
        break;
    }

    this.article = updatedArticle;
    this.articleService.trackModification(this.article);
  }

  selectInputContent(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  // Helper method to display values with units
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
}

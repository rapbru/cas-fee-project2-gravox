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
    private articleService: ArticleService
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
    if (this.article) {
      this.http.post(`${environment.apiUrl}/article/${this.article.id}/load`, {})
        .subscribe({
          next: () => {
            console.log('Article loaded successfully');
          },
          error: (error) => {
            console.error('Error loading article:', error);
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
    const newValue = inputElement.value;

    // Log the change
    console.log(`Updating ${field} to:`, newValue);

    // Create a new article object with the updated value
    const updatedArticle = { ...this.article };
    
    switch (field) {
      case 'title':
        updatedArticle.title = newValue;
        break;
      case 'number':
        updatedArticle.number = newValue;
        break;
      case 'customer':
        updatedArticle.customer = newValue;
        break;
      // Add other fields as needed
    }

    // Update the article reference
    this.article = updatedArticle;
    
    // Track the modification
    console.log('Tracking modification for article:', this.article);
    this.articleService.trackModification(this.article);
  }

  selectInputContent(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.select();
  }
}

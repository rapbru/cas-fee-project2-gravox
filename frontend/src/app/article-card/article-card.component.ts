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
  styleUrls: ['./article-card.component.scss']
})
export class ArticleCardComponent {
  @Input() article!: Article;
  @Input() showHeader: boolean = true;
  @Input() showCheckbox: boolean = false;
  @Input() isSelected: boolean = false;
  @Input() isEditable: boolean = false;
  @Input() isLoadButtonDisabled: boolean = false;
  @Output() selectionChange = new EventEmitter<boolean>();
  @Output() cardClick = new EventEmitter<number>();

  constructor(
    private router: Router,
    private http: HttpClient
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
}

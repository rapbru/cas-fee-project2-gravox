import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Article } from '../models/article.model';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    FormsModule,
    MatTooltipModule
  ],
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.scss']
})
export class ArticleCardComponent {
  @Input() article!: Article;
  @Input() showCheckbox = false;
  @Input() showHeader = true;
  @Input() isArticleView = false;
  @Output() cardClick = new EventEmitter<number>();
  @Output() loadClick = new EventEmitter<void>();

  onCardClick() {
    if (this.article.id) {
      this.cardClick.emit(this.article.id);
    }
  }
}

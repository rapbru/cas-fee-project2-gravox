import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { Article } from '../models/article.model';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.scss']
})
export class ArticleCardComponent {
  @Input() article!: Article;
  @Input() showCheckbox = false;
  @Input() showHeader = true;
  @Output() cardClick = new EventEmitter<number>();
  @Output() loadClick = new EventEmitter<void>();

  onCardClick() {
    if (this.article.id) {
      this.cardClick.emit(this.article.id);
    }
  }

  onLoad() {
    this.loadClick.emit();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoggerService } from '../services/logger.service';
import { environment } from '../../environments/environment';
import { Article } from '../models/article.model';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { ArticleCardComponent } from '../article-card/article-card.component';
import { OverviewStateService } from '../services/overview-state.service';
import { ArticleService } from '../services/article.service';
import { DialogService } from '../services/dialog.service';
import { forkJoin } from 'rxjs';
import { HeaderService } from '../services/header.service';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ToolbarComponent,
    ArticleCardComponent
  ],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {
  private enableLogging = environment.enableLogging;
  articles: Article[] = [];
  isReorderMode = false;
  public readonly enableEdit = this.overviewStateService.enableEdit;

  displayedColumns: string[] = [
    'select',
    'title',
    'number',
    'customer',
    'area',
    'drainage',
    'anodic',
    'note'
  ];

  constructor(
    private articleService: ArticleService,
    private router: Router,
    private loggerService: LoggerService,
    private overviewStateService: OverviewStateService,
    private dialogService: DialogService,
    private headerService: HeaderService
  ) {}

  ngOnInit() {
    this.headerService.setTitle('Artikel');
    this.loadArticles();
  }

  loadArticles() {
    this.articleService.getArticles().subscribe({
      next: (articles) => {
        this.articles = articles;
      },
      error: (error) => {
        this.loggerService.error('Error loading articles:', error);
      }
    });
  }

  navigateToDetails(id: string | number | undefined) {
    if (id !== undefined) {
      this.router.navigate(['/articles', id.toString()]);
    } else {
      if (this.enableLogging) {
        this.loggerService.error('Cannot navigate: Article ID is undefined');
      }
    }
  }

  hasSelectedArticles(): boolean {
    return this.articles.some(article => article.selected);
  }

  hasExactlyOneSelected(): boolean {
    return this.articles.filter(article => article.selected).length === 1;
  }

  loadSelectedArticle(): void {
    const selectedArticle = this.articles.find(article => article.selected);
    if (selectedArticle?.id) {
      this.navigateToDetails(selectedArticle.id);
    }
  }

  async deleteSelectedArticles() {
    const selectedArticles = this.articles.filter(article => article.selected);
    
    if (selectedArticles.length === 0) return;

    const confirmed = await this.dialogService.showConfirmDialog({
      title: 'Artikel löschen',
      message: selectedArticles.length === 1 
        ? 'Möchten Sie diesen Artikel wirklich löschen?' 
        : `Möchten Sie diese ${selectedArticles.length} Artikel wirklich löschen?`,
      confirmText: 'Löschen',
      cancelText: 'Abbrechen',
      confirmClass: 'danger'
    });

    if (!confirmed) return;

    const deleteObservables = selectedArticles
      .filter(article => article.id)
      .map(article => this.articleService.deleteArticle(article.id!));

    forkJoin(deleteObservables).subscribe({
      next: () => {
        this.loggerService.log('Articles deleted successfully');
        this.loadArticles();
      },
      error: (error) => {
        this.loggerService.error('Error deleting articles:', error);
      }
    });
  }

  isLoadButtonDisabled(currentArticle: Article): boolean {
    const selectedArticles = this.articles.filter(article => article.selected);
    
    if (selectedArticles.length === 0) {
      return false;
    } else if (selectedArticles.length === 1) {
      return !currentArticle.selected;
    } else {
      return true;
    }
  }

  enableOrder(): boolean {
    return this.isReorderMode;
  }

  onAddLine() {
    // Implement if needed or remove from template
  }

  onDeleteLine() {
    // Implement if needed or remove from template
  }

  onAdd() {
    this.router.navigate(['/articles/add']);
  }

  onReorder() {
    this.isReorderMode = !this.isReorderMode;
  }

  onDelete() {
    this.deleteSelectedArticles();
  }
}


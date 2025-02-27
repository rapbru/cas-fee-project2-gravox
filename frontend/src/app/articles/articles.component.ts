import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { FooterComponent } from '../footer/footer.component';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    ArticleCardComponent,
    FooterComponent,
    AsyncPipe,
    MatProgressSpinnerModule
  ],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {
  private enableLogging = environment.enableLogging;
  articles: Article[] = [];
  isReorderMode = false;
  isEditMode = false;
  public readonly enableEdit = this.overviewStateService.enableEdit;
  selectedArticles: Set<Article> = new Set();
  articles$: Observable<Article[]>;
  isUpdating = this.articleService.getIsUpdating();

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
  ) {
    this.isEditMode = this.overviewStateService.enableEdit();
    this.articles$ = this.articleService.getArticles();

    effect(() => {
      this.isEditMode = this.overviewStateService.enableEdit();
    });
  }

  ngOnInit() {
    this.headerService.setTitle('Artikel');
    if (!this.articleService.getIsUpdating()()) {
      this.loadArticles();
      this.articleService.reloadArticles();
    }
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

  onArticleSelection(article: Article, isSelected: boolean) {
    if (isSelected) {
      this.selectedArticles.add(article);
    } else {
      this.selectedArticles.delete(article);
    }
  }

  hasSelectedArticles(): boolean {
    return this.selectedArticles.size > 0;
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
    if (this.selectedArticles.size === 0) {
      this.loggerService.log('No articles selected');
      return;
    }

    this.loggerService.log('Selected articles before deletion:', 
      Array.from(this.selectedArticles).map(a => ({ id: a.id, title: a.title }))
    );

    const confirmed = await this.dialogService.showConfirmDialog({
      title: 'Artikel löschen',
      message: this.selectedArticles.size === 1 
        ? 'Möchten Sie diesen Artikel wirklich löschen?' 
        : `Möchten Sie diese ${this.selectedArticles.size} Artikel wirklich löschen?`,
      confirmText: 'Löschen',
      cancelText: 'Abbrechen',
      confirmClass: 'danger'
    });

    if (!confirmed) {
      this.loggerService.log('Deletion cancelled by user');
      return;
    }

    const articlesToDelete = Array.from(this.selectedArticles)
      .filter(article => article.id);
    
    this.loggerService.log('Articles to be deleted:', 
      articlesToDelete.map(a => ({ id: a.id, title: a.title }))
    );

    if (articlesToDelete.length === 0) {
      this.loggerService.warn('No valid articles to delete');
      return;
    }

    const deleteObservables = articlesToDelete
      .map(article => {
        this.loggerService.log(`Creating delete observable for article ID: ${article.id}`);
        return this.articleService.deleteArticle(article.id!);
      });

    forkJoin(deleteObservables).subscribe({
      next: () => {
        this.loggerService.log('Articles deleted successfully');
        this.selectedArticles.clear();
        
        this.articleService.reloadArticles();
        
        if (this.articles) {
          this.articles = this.articles.filter(article => 
            !articlesToDelete.some(deleteArticle => deleteArticle.id === article.id)
          );
        }
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


import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '../services/audio.service';
import { KeyEventService } from '../key-event.service';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputFieldComponent} from "../input-field/input-field.component";
import { HttpClientModule, HttpClient } from '@angular/common/http';

export interface Article {
  id: string;
  title: { id: string; value: string };
  area: { id: string; value: string };
  drainage: { id: string; value: string };
  anodic: { id: string; value: string };
  note: { id: string; value: string };
  createdBy: { id: string; value: string };
  createdDate: { id: string; value: string };
  modifiedBy: { id: string; value: string };
  modifiedDate: { id: string; value: string };
}

@Component({
  selector: 'app-add-article',
  standalone: true,
  imports: [
    MatIcon,
    MatTooltip,
    FormsModule,
    CommonModule,
    InputFieldComponent,
    HttpClientModule
  ],
  templateUrl: './add-article.component.html',
})
export class AddArticleComponent implements OnInit, OnDestroy {
  articleName = '';
  articleSurface = '';
  articleDripOff = '';
  articleAnodic = '';
  articleComment = '';
  isFocused = false;

  maxLengthName = 20;
  maxLengthSurface = 20;
  maxLengthDripOff = 20;
  maxLengthAnodic = 20;
  maxLengthComment = 100;

  articles: Article[] = [];
  private readonly currentUser = 'Current User';

  constructor(
    private http: HttpClient,
    private audioService: AudioService,
    private keyEventService: KeyEventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Registering key event handlers directly without the subscription
    this.keyEventService.registerKeyAction('Escape', this.onEscapeKey.bind(this));
    this.keyEventService.registerKeyAction('Enter', this.onSaveKey.bind(this));
    this.loadArticles();
  }

  ngOnDestroy(): void {
    // No subscription to clean up
  }

  loadArticles(): void {
    this.http.get<{ articles: Article[] }>('assets/articles-data.json').subscribe({
      next: (data) => (this.articles = data.articles),
      error: (err) => console.error('Error loading articles:', err)
    });
  }

  onSave(): void {
    const newArticle: Article = {
      id: Date.now().toString(),
      title: { id: '', value: this.articleName },
      area: { id: '', value: this.articleSurface },
      drainage: { id: '', value: this.articleDripOff },
      anodic: { id: '', value: this.articleAnodic },
      note: { id: '', value: this.articleComment },
      createdBy: { id: '', value: this.currentUser },
      createdDate: { id: '', value: new Date().toISOString() },
      modifiedBy: { id: '', value: this.currentUser },
      modifiedDate: { id: '', value: new Date().toISOString() }
    };

    this.articles.push(newArticle);
    console.log('Updated Articles:', this.articles);
    this.saveToJson();
  }

  saveToJson(): void {
    const blob = new Blob(
      [JSON.stringify({ articles: this.articles }, null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'articles-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  onEscapeKey(): void {
    if (!this.isFocused) {
      this.router.navigate(['/articles']);
    }
  }

  onSaveKey(): void {
    this.onSave();
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AudioService } from '../services/audio.service';
import { KeyEventService } from '../key-event.service';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { InputFieldComponent } from '../input-field/input-field.component';
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
    CommonModule,
    FormsModule,
    MatIcon,
    MatTooltip,
    InputFieldComponent,
    HttpClientModule
  ],
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.scss']
})
export class AddArticleComponent {
  article = {
    name: '',
    number: '',
    customer: '',
    surface: '',
    dripOff: '',
    anodic: '',
    comment: ''
  };

  maxLengthName = 50;
  maxLengthNumber = 20;
  maxLengthCustomer = 50;
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
    this.keyEventService.registerKeyAction('Escape', this.onEscapeKey.bind(this));
    this.keyEventService.registerKeyAction('Enter', this.onSaveKey.bind(this));
    this.loadArticles();
  }

  ngOnDestroy(): void {
    return;
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
      title: { id: '', value: this.article.name },
      area: { id: '', value: this.article.surface },
      drainage: { id: '', value: this.article.dripOff },
      anodic: { id: '', value: this.article.anodic },
      note: { id: '', value: this.article.comment },
      createdBy: { id: '', value: this.currentUser },
      createdDate: { id: '', value: new Date().toISOString() },
      modifiedBy: { id: '', value: this.currentUser },
      modifiedDate: { id: '', value: new Date().toISOString() }
    };

    this.http.post('http://localhost:3001/article', newArticle).subscribe({
      next: (response) => {
        console.log('Article saved successfully:', response);
        this.articles.push(newArticle);
      },
      error: (err) => console.error('Error saving article:', err)
    });
  }

  onEscapeKey(): void {
    this.router.navigate(['/articles']);
  }

  onSaveKey(): void {
    this.onSave();
  }
}

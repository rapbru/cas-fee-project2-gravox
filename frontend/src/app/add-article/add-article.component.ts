import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoggerService } from '../services/logger.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputFieldComponent } from '../input-field/input-field.component';
import { Article } from '../models/article.model';

@Component({
  selector: 'app-add-article',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    InputFieldComponent,
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

  constructor(
    private http: HttpClient,
    private router: Router,
    private loggerService: LoggerService
  ) {}

  onSave() {
    this.loggerService.log('Saving article:', this.article);
    
    const articleData: Article = {
      title: { value: this.article.name },
      number: { value: this.article.number },
      customer: { value: this.article.customer },
      area: { value: this.article.surface },
      drainage: { value: this.article.dripOff },
      anodic: { value: this.article.anodic },
      note: { value: this.article.comment },
      createdBy: { value: 'system' }, // You might want to get this from a user service
      sequence: [] // Empty array for new articles
    };

    this.http.post<Article>('http://localhost:3001/article', articleData)
      .subscribe({
        next: (response) => {
          this.loggerService.log('Article saved successfully:', response);
          this.router.navigate(['/articles']);
        },
        error: (error) => {
          this.loggerService.error('Error saving article:', error);
        }
      });
  }

  onEscapeKey() {
    this.router.navigate(['/articles']);
  }
}

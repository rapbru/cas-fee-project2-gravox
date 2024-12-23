import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputFieldComponent } from '../input-field/input-field.component';
import { Article } from '../models/article.model';
import { LoggerService } from '../services/logger.service';
import { environment } from '../../environments/environment';

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
  templateUrl: './add-article.component.html'
})
export class AddArticleComponent {
  private enableLogging = environment.enableLogging;

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
    if (this.enableLogging) {
      this.loggerService.log('Saving article:', this.article);
    }
    
    const articleData: Article = {
      title: { value: this.article.name },
      number: { value: this.article.number },
      customer: { value: this.article.customer },
      area: { value: this.article.surface },
      drainage: { value: this.article.dripOff },
      anodic: { value: this.article.anodic },
      note: { value: this.article.comment },
      createdBy: { value: 'system' },
      sequence: []
    };

    this.http.post<Article>(`${environment.apiUrl}/article`, articleData)
      .subscribe({
        next: (response) => {
          if (this.enableLogging) {
            this.loggerService.log('Article saved successfully:', response);
          }
          this.router.navigate(['/articles']);
        },
        error: (error) => {
          if (this.enableLogging) {
            this.loggerService.error('Error saving article:', error);
          }
        }
      });
  }

  onEscapeKey() {
    this.router.navigate(['/articles']);
  }
}

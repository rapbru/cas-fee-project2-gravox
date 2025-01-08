import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputFieldComponent } from '../input-field/input-field.component';
import { Article } from '../models/article.model';
import { Position } from '../models/position.model';
import { LoggerService } from '../services/logger.service';
import { environment } from '../../environments/environment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HeaderService } from '../services/header.service';
import { PositionService } from '../services/position.service';
import { OverviewComponent } from '../overview/overview.component';

@Component({
  selector: 'app-add-article',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    InputFieldComponent,
    MatFormFieldModule,
    MatInputModule,
    OverviewComponent
  ],
  templateUrl: './add-article.component.html'
})
export class AddArticleComponent implements OnInit {
  private enableLogging = environment.enableLogging;
  positions: Position[] = [];

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
    private loggerService: LoggerService,
    private headerService: HeaderService,
    private positionService: PositionService
  ) {}

  ngOnInit() {
    this.headerService.setTitle('Artikeldaten');
    this.loadPositions();
  }

  private loadPositions() {
    this.positionService.positions$.subscribe({
      next: (positions) => {
        this.positions = positions;
        if (this.enableLogging) {
          this.loggerService.log('Loaded positions:', positions);
        }
      },
      error: (error) => {
        if (this.enableLogging) {
          this.loggerService.error('Error loading positions:', error);
        }
      }
    });
  }

  onSave() {
    if (this.enableLogging) {
      this.loggerService.log('Saving article:', this.article);
    }
    
    const articleData: Article = {
      title: this.article.name,
      number: this.article.number,
      customer: this.article.customer,
      area: this.article.surface,
      drainage: this.article.dripOff,
      anodic: this.article.anodic,
      note: this.article.comment,
      createdBy: 'system',
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

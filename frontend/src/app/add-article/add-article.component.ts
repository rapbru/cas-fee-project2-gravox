import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputFieldComponent } from '../input-field/input-field.component';
import { Article, Sequence } from '../models/article.model';
import { Position } from '../models/position.model';
import { LoggerService } from '../services/logger.service';
import { environment } from '../../environments/environment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HeaderService } from '../services/header.service';
import { PositionService } from '../services/position.service';
import { PositionSequenceComponent } from '../position/position-sequence/position-sequence.component';
import { SnackbarService } from '../services/snackbar.service';
import { FooterComponent } from '../footer/footer.component';
import { ArticleService } from '../services/article.service';
import { catchError, tap } from 'rxjs';
import { of } from 'rxjs';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { ViewChild } from '@angular/core';

interface ArticleForm {
  name: string;
  number: string;
  customer: string;
  surface: string;
  dripOff: string;
  comment?: string;
  sequence?: Sequence[];
}

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
    PositionSequenceComponent,
    FooterComponent
  ],
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.scss']
})
export class AddArticleComponent implements OnInit {
  private enableLogging = environment.enableLogging;
  
  @ViewChild('articleForm') articleForm!: NgForm;

  article: ArticleForm = {
    name: '',
    number: '',
    customer: '',
    surface: '',
    dripOff: '',
    comment: '',
    sequence: []
  };

  maxLengthName = 50;
  maxLengthNumber = 20;
  maxLengthCustomer = 50;
  maxLengthSurface = 20;
  maxLengthDripOff = 20;
  maxLengthAnodic = 20;
  maxLengthComment = 100;

  sequences: Sequence[] = [];

  isSaving = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private loggerService: LoggerService,
    private headerService: HeaderService,
    public positionService: PositionService,
    private snackbarService: SnackbarService,
    private articleService: ArticleService,
    private fb: FormBuilder
  ) {
    this.loggerService.log('AddArticleComponent constructed');
  }

  ngOnInit() {
    this.loggerService.log('AddArticleComponent initialized');
    this.headerService.setTitle('Neuer Artikel');
    
    this.fetchPositionsOnce();
  }

  private fetchPositionsOnce() {
    this.positionService.fetchPositions();
  }

  ngOnDestroy() {
  }

  onSequenceChange(sequences: any[]) {
    this.loggerService.log('Sequence changed:', sequences);
    this.sequences = sequences.map(seq => ({
        positionId: seq.positionId.toString(),
        orderNumber: seq.orderNumber,
        timePreset: seq.timePreset,
        currentPreset: seq.currentPreset,
        voltagePreset: seq.voltagePreset
    }));
  }

  private validateArticleData(articleData: ArticleForm): boolean {
    if (!articleData.name.trim() || !articleData.number.trim() || !articleData.customer.trim()) {
        this.snackbarService.showError('Bitte füllen Sie alle Pflichtfelder aus');
        return false;
    }
    if (!articleData.sequence || articleData.sequence.length === 0) {
        this.snackbarService.showError('Bitte fügen Sie mindestens eine Position hinzu');
        return false;
    }
    return true;
  }

  onSave() {
    if (this.isSaving) return;
    
    this.isSaving = true;
    const articleData: ArticleForm = {
      name: this.article.name,
      number: this.article.number,
      customer: this.article.customer,
      surface: this.article.surface,
      dripOff: this.article.dripOff,
      comment: this.article.comment,
      sequence: this.sequences
    };

    if (!this.validateArticleData(articleData)) {
      this.isSaving = false;
      return;
    }

    // Convert ArticleForm to Article before saving
    const articleToSave: Article = {
      title: articleData.name,
      number: articleData.number,
      customer: articleData.customer,
      area: articleData.surface,
      drainage: articleData.dripOff,
      anodic: '', // Add default value or get from form
      note: articleData.comment,
      sequence: articleData.sequence
    };

    this.loggerService.log('Sending article data:', articleToSave);

    this.articleService.saveArticle(articleToSave).pipe(
      tap(() => {
        this.articleService.reloadArticles();
        this.router.navigate(['/articles']);
      }),
      catchError(error => {
        this.loggerService.error('Error saving article:', {
          error,
          sentData: articleToSave,
          errorMessage: error.error?.error,
          status: error.status,
          statusText: error.statusText
        });
        const errorMessage = error.error?.error || 'Fehler beim Speichern des Artikels';
        this.snackbarService.showError(errorMessage);
        this.isSaving = false;
        return of(null);
      })
    ).subscribe();
  }

  onEscapeKey() {
    this.router.navigate(['/articles']);
  }

  enableEdit(): boolean {
    return true;
  }

  isFormValid(): boolean {
    return !!(
      this.article.name &&
      this.article.number &&
      this.article.customer &&
      this.article.surface &&
      this.article.dripOff
    );
  }
}

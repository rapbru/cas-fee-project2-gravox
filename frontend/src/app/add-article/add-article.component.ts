import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputFieldComponent } from '../input-field/input-field.component';
import { Article, Sequence as ArticleSequence } from '../models/article.model';
import { Position } from '../models/position.model';
import { LoggerService } from '../services/logger.service';
import { environment } from '../../environments/environment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HeaderService } from '../services/header.service';
import { PositionService } from '../services/position.service';
import { PositionSequenceComponent } from '../position/position-sequence/position-sequence.component';
import { Sequence as PositionSequence } from '../models/sequence.model';
import { SnackbarService } from '../services/snackbar.service';
import { FooterComponent } from '../footer/footer.component';

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

  sequences: ArticleSequence[] = [];

  isSaving = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private loggerService: LoggerService,
    private headerService: HeaderService,
    public positionService: PositionService,
    private snackbarService: SnackbarService
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

  private validateArticleData(articleData: Article): boolean {
    if (!articleData.title.trim() || !articleData.number.trim() || !articleData.customer.trim()) {
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
    const articleData: Article = {
        title: this.article.name,
        number: this.article.number,
        customer: this.article.customer,
        area: this.article.surface,
        drainage: this.article.dripOff,
        anodic: this.article.anodic,
        note: this.article.comment,
        createdBy: 'system',
        sequence: this.sequences
    };

    if (!this.validateArticleData(articleData)) {
        this.isSaving = false;
        return;
    }

    this.loggerService.log('Sending article data:', articleData);

    this.http.post<Article>(`${environment.apiUrl}/article`, articleData)
        .subscribe({
            next: (response) => {
                this.loggerService.log('Article saved successfully:', response);
                this.snackbarService.showSuccess('Artikel erfolgreich gespeichert');
                this.router.navigate(['/articles']);
            },
            error: (error) => {
                this.loggerService.error('Error saving article:', {
                    error,
                    sentData: articleData,
                    errorMessage: error.error?.error,
                    status: error.status,
                    statusText: error.statusText
                });
                const errorMessage = error.error?.error || 'Fehler beim Speichern des Artikels';
                this.snackbarService.showError(errorMessage);
                this.isSaving = false;
            },
            complete: () => {
                this.isSaving = false;
            }
        });
  }

  onEscapeKey() {
    this.router.navigate(['/articles']);
  }

  enableEdit(): boolean {
    return true;  // Always enable edit mode in add-article
  }
}

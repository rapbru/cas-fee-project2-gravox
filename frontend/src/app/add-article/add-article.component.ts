import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SequenceCardComponent } from '../position/sequence-card/sequence-card.component';

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
    MatButtonModule,
    DragDropModule,
    SequenceCardComponent
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
  selectedPositions: Position[] = [];
  editingPosition: Position | null = null;
  editingField: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private loggerService: LoggerService,
    private headerService: HeaderService,
    public positionService: PositionService
  ) {
    this.loggerService.log('AddArticleComponent constructed');
  }

  ngOnInit() {
    this.loggerService.log('AddArticleComponent initialized');
    this.headerService.setTitle('Artikeldaten');
    this.positionService.startFetching();
  }

  ngOnDestroy() {
    this.positionService.stopFetching();
  }

  onSequenceChange(sequences: ArticleSequence[]) {
    this.sequences = sequences.map(seq => ({
      positionId: seq.positionId,
      orderNumber: seq.orderNumber,
      timePreset: (seq.timePreset ?? 0).toString(),
      currentPreset: (seq.currentPreset ?? 0).toString(),
      voltagePreset: (seq.voltagePreset ?? 0).toString()
    }));
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
      sequence: this.sequences
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

  toggleSelection(position: Position) {
    position.isSelected = !position.isSelected;
  }

  removePosition(position: Position) {
    this.selectedPositions = this.selectedPositions.filter(p => p !== position);
    // Update any other state as needed
  }

  startEditing(event: {position: Position, field: string}) {
    this.editingPosition = event.position;
    this.editingField = event.field;
  }

  confirmEdit(event: {position: Position, field: string, value: string}) {
    const value = parseFloat(event.value);
    if (!isNaN(value)) {
      const position = this.selectedPositions.find(p => p === event.position);
      if (position) {
        switch(event.field) {
          case 'timePreset':
            position.timePreset = value;
            break;
          case 'currentPreset':
            position.currentPreset = value;
            break;
          case 'voltagePreset':
            position.voltagePreset = value;
            break;
        }
      }
    }
    this.editingPosition = null;
    this.editingField = null;
  }

  cancelEdit() {
    this.editingPosition = null;
    this.editingField = null;
  }

  onDrop(event: CdkDragDrop<Position[]>) {
    moveItemInArray(
      this.selectedPositions,
      event.previousIndex,
      event.currentIndex
    );
  }
}

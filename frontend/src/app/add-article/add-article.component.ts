import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '../services/audio.service';
import { KeyEventService } from '../key-event.service';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {InputFieldComponent} from '../input-field/input-field.component';

@Component({
  selector: 'app-add-article',
  standalone: true,
  imports: [
    MatIcon,
    MatTooltip,
    FormsModule,
    CommonModule,
    InputFieldComponent
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

  handleArticleNameChange(newValue: string): void {
    this.articleName = newValue;
  }

  handleArticleSurfaceChange(newValue: string): void {
    this.articleSurface = newValue;
  }

  handleArticleDripoffChange(newValue: string): void {
    this.articleDripOff = newValue;
  }

  handleArticleAnodicChange(newValue: string): void {
    this.articleAnodic = newValue;
  }

  handleArticleCommentChange(newValue: string): void {
    this.articleComment = newValue;
  }

  private keyPressSubscription: Subscription | undefined;

  constructor(
    private audioService: AudioService,
    private keyEventService: KeyEventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.keyEventService.registerKeyAction('Escape', this.onEscapeKey.bind(this));
    this.keyEventService.registerKeyAction('Enter', this.onSaveKey.bind(this));
  }

  ngOnDestroy(): void {
    this.keyEventService.keyPressed.unsubscribe();
  }

  onEscapeKey(): void {
    if (!this.isFocused) {
      this.router.navigate(['/articles']);
    }
  }

  onSaveKey(): void {
    return  }
}

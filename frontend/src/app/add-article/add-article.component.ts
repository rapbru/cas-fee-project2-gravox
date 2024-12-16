import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '../audio.service';
import { KeyEventService } from '../key-event.service';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-article',
  standalone: true,
  imports: [
    MatIcon,
    MatTooltip,
    FormsModule,
    CommonModule
  ],
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.scss']
})
export class AddArticleComponent implements OnInit, OnDestroy {
  inputValueNameArticle = '';
  isFocused = false;
  flashCounter = false;

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

  onInputChange(): void {
    const inputLength = this.inputValueNameArticle?.length || 0;
    if (inputLength >= 20) {
      this.flashCounter = true;
      this.audioService.playErrorSound();
      setTimeout(() => {
        this.flashCounter = false;
      }, 1000);
    }
  }
}

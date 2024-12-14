import { Component, OnInit, OnDestroy } from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatMiniFabButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import { AudioService } from '../audio.service';
import { KeyEventService } from '../key-event.service';

@Component({
  selector: 'app-add-article',
  standalone: true,
  imports: [
    MatIcon,
    MatMiniFabButton,
    MatTooltip,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './add-article.component.html',
  styleUrl: './add-article.component.scss'
})

export class AddArticleComponent implements OnInit, OnDestroy {
  inputValueNameArticle = '';
  isFocused = false;
  flashCounter = false;

  constructor(
    private audioService: AudioService,
    private keyEventService: KeyEventService
  ) {}

  ngOnInit(): void {
    this.keyEventService.registerKeyAction('Escape', this.onEscapeKey.bind(this));
    this.keyEventService.registerKeyAction('Enter', this.onEnterKey.bind(this));
  }

  ngOnDestroy(): void {
    if (!this.isFocused) {
      return    }
  }

  public onEscapeKey(): void {
    if (!this.isFocused) {
return
    }
  }

  public onEnterKey(): void {
    return
  }

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

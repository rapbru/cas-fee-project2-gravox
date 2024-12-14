import { Component } from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatMiniFabButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import { AudioService } from '../audio.service';


@Component({
  selector: 'app-add-article',
  standalone: true,
  imports: [
    MatIcon,
    MatMiniFabButton,
    MatTooltip,
    FormsModule,
    CommonModule
  ],
  templateUrl: './add-article.component.html',
  styleUrl: './add-article.component.scss'
})

export class AddArticleComponent {
  inputValueNameArticle = '';
  isFocused = false;
  flashCounter = false;

  constructor(private audioService: AudioService) {}

  onInputChange() {
    const inputLength = this.inputValueNameArticle?.length || 0;
    if (inputLength >= 20) {
      this.flashCounter = true;
      this.audioService.playTone();
      setTimeout(() => {
        this.flashCounter = false;
      }, 1000);
    }
  }
}

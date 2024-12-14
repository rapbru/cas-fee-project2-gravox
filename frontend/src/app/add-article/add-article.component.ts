import { Component } from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatMiniFabButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

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

  private playWarningSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  }

  onInputChange() {
    const inputLength = this.inputValueNameArticle?.length || 0;
    if (inputLength >= 20) {
      this.flashCounter = true;
      this.playWarningSound();
      setTimeout(() => {
        this.flashCounter = false;
      }, 1000);
    }
  }
}

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
  inputValue = '';
  isFocused = false;
  flashCounter = false;

  onInputChange() {
    if ((this.inputValue?.length || 0) === 20) {
      this.flashCounter = true;
      setTimeout(() => {
        this.flashCounter = false;
      }, 1000);
    }
  }
}

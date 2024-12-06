import { Component } from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatMiniFabButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-add-article',
  standalone: true,
  imports: [
    MatIcon,
    MatMiniFabButton,
    MatTooltip,
    FormsModule
  ],
  templateUrl: './add-article.component.html',
  styleUrl: './add-article.component.scss'
})
export class AddArticleComponent {
  inputValue = '';

  clearInput() {
    this.inputValue = '';
  }
}

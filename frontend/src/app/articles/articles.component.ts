import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss'
})
export class ArticlesComponent {
  constructor(private router: Router) {}

  navigateToArticles() {
    this.router.navigate(['/articles']);
  }
}

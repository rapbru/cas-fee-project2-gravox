import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Article } from '../articles/articles.component'; // Import the Article interface

@Component({
  selector: 'app-articles-details',
  templateUrl: './articles-details.component.html',
  styleUrls: ['./articles-details.component.scss']
})
export class ArticlesDetailsComponent implements OnInit {
  article: Article | undefined; // Article object
  articleId: string | null = null; // Article ID from route

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.articleId = this.route.snapshot.paramMap.get('id'); // Get articleId from route params

    // Fetch article data from JSON or API based on the articleId
    this.http.get<{ articles: Article[] }>('/assets/articles-data.json').subscribe((data) => {
      this.article = data.articles.find(article => article.id === this.articleId); // Find article by id
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Article } from '../articles/articles.component';

@Component({
  selector: 'app-articles-details',
  standalone: true,
  imports: [],
  templateUrl: './articles-details.component.html',
  styleUrls: ['./articles-details.component.scss']
})
export class ArticlesDetailsComponent implements OnInit {

  articleId: string | null = null;
  article: Article | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.articleId = this.route.snapshot.paramMap.get('id');
  }
}

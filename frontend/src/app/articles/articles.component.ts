import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss'] // Corrected from styleUrl to styleUrls
})
export class ArticlesComponent {
  isMobile = false; // Type annotation removed

  constructor(private router: Router, private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet,
      Breakpoints.Web
    ]).subscribe(result => {
      this.isMobile = result.matches && (result.breakpoints[Breakpoints.Handset] || result.breakpoints[Breakpoints.Tablet]);
    });
  }

  navigateToArticles() {
    this.router.navigate(['/articles']);
  }
}

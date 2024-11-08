import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from '../toolbar/toolbar.component';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, ToolbarComponent],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {
  isMobile = false;

  ngOnInit() {
    this.checkMobile();
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkMobile();
  }

  private checkMobile() {
    this.isMobile = window.matchMedia('(max-width: 600px)').matches;
    console.log('isMobile (matchMedia):', this.isMobile);
  }
}

import { Component, OnInit } from '@angular/core';
import { ScreenService } from 'src/app/shared/screen.service';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {
  isMobile: boolean = false;

  constructor(private screenService: ScreenService) {}

  ngOnInit() {
    this.screenService.isMobile$.subscribe((isMobile: boolean) => {
      this.isMobile = isMobile;
      console.log('isMobile (ScreenService):', this.isMobile);
    });
  }
}


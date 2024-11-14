import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { DeviceDetectionService } from '../services/device-detection.service';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

interface Article {
  number: string;
  customer: string;
  area: string;
  drainage: string;
  anodic: string;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  note: string;
}

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, ToolbarComponent, MatCardModule, HttpClientModule],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {
  article: Article | null = null;
  isMobile = this.deviceDetectionService.isMobileSignal;

  constructor(
    private deviceDetectionService: DeviceDetectionService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.http.get<{ article: Article }>('/assets/data.json').subscribe((data) => {
      this.article = data.article;
    });
  }
}

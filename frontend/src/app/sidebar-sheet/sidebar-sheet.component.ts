import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar-sheet',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './sidebar-sheet.component.html',
  styleUrls: ['./sidebar-sheet.component.scss']
})
export class SidebarSheetComponent implements OnInit {
  @Input() title: string = '';
  @Input() show: boolean = false;
  @Output() showChange = new EventEmitter<boolean>();
  @Input() enableBackdrop: boolean = true;
  
  isMobile: boolean = window.innerWidth < 768;
  enableTransitions: boolean = false;

  ngOnInit() {
    setTimeout(() => {
      this.enableTransitions = true;
    }, 100);
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;
    
    if (wasMobile !== this.isMobile && this.show) {
      this.close();
    }
  }

  close() {
    this.show = false;
    this.showChange.emit(this.show);
  }
}

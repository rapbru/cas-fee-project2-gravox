import { Component, Input, Output, EventEmitter, HostListener, OnInit, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar-sheet',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './sidebar-sheet.component.html',
  styleUrls: ['./sidebar-sheet.component.scss']
})
export class SidebarSheetComponent implements OnInit, AfterContentInit {
  @Input() title: string = '';
  @Input() set show(value: boolean) {
    if (value !== this._show) {
      this._show = value;
      if (value) {
        setTimeout(() => {
          this.opened.emit();
          this.cdr.detectChanges();
        }, 300); 
      }
    }
  }
  get show(): boolean {
    return this._show;
  }
  private _show = false;
  
  @Output() showChange = new EventEmitter<boolean>();
  @Output() opened = new EventEmitter<void>();
  @Input() enableBackdrop: boolean = true;
  
  isMobile: boolean = window.innerWidth < 768;
  enableTransitions: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.checkScreenSize();
    setTimeout(() => {
      this.enableTransitions = true;
      this.cdr.detectChanges();
    }, 100);
  }

  ngAfterContentInit() {
    this.cdr.detectChanges();
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

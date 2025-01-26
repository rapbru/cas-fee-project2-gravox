import { Component, OnInit, HostBinding } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './authentication/auth.service';
import { NavbarComponent } from "./navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { HeaderService } from './services/header.service';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { KeyBindingService } from './services/key-binding.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    NavbarComponent, 
    CommonModule,
    MatDialogModule,
    ToolbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'gravox';
  showToolbar = false;

  @HostBinding('attr.aria-hidden') ariaHidden = null;

  constructor(
    public authService: AuthService, 
    private matIconReg: MatIconRegistry,
    public headerService: HeaderService,
    private keyBindingService: KeyBindingService
  ) {}

  ngOnInit(): void {
    this.matIconReg.setDefaultFontSetClass('material-symbols-outlined');
  }
}

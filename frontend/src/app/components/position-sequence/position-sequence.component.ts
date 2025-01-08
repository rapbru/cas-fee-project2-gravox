import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Position } from '../../models/position.model';
import { PositionService } from '../../services/position.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-position-sequence',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './position-sequence.component.html',
  styleUrls: ['./position-sequence.component.scss']
})
export class PositionSequenceComponent {
  constructor(
    public positionService: PositionService,
    private logger: LoggerService
  ) {}

  ngOnInit() {
    this.logger.log('PositionSequenceComponent initialized');
    this.positionService.startFetching();
  }

  ngOnDestroy() {
    this.positionService.stopFetching();
  }
}

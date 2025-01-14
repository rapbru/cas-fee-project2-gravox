import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionCardComponent } from './position-card.component';

describe('PositionCardComponent', () => {
  let component: PositionCardComponent;
  let fixture: ComponentFixture<PositionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PositionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

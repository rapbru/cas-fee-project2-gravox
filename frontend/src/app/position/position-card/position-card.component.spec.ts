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
    
    // Mock Position Objekt
    component.position = {
      id: 1,
      number: 1,
      name: 'Test Position',
      time: { actual: 0, preset: 0 },
      temperature: { actual: 0, preset: 0, isPresent: false },
      current: { actual: 0, preset: 0, isPresent: false },
      voltage: { actual: 0, preset: 0, isPresent: false }
    };
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
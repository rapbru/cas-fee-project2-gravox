import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionSequenceComponent } from './position-sequence.component';

describe('PositionSequenceComponent', () => {
  let component: PositionSequenceComponent;
  let fixture: ComponentFixture<PositionSequenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionSequenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PositionSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

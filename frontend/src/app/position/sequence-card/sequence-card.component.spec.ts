import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceCardComponent } from './sequence-card.component';

describe('SequenceCardComponent', () => {
  let component: SequenceCardComponent;
  let fixture: ComponentFixture<SequenceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SequenceCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SequenceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

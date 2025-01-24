import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyspaceComponent } from './emptyspace.component';

describe('EmptyspaceComponent', () => {
  let component: EmptyspaceComponent;
  let fixture: ComponentFixture<EmptyspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyspaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptyspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

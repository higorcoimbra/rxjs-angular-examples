import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeANoteComponent } from './take-a-note.component';

describe('TakeANoteComponent', () => {
  let component: TakeANoteComponent;
  let fixture: ComponentFixture<TakeANoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TakeANoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TakeANoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateParseInputComponent } from './date-parse-input.component';

describe('DateParseInputComponent', () => {
  let component: DateParseInputComponent;
  let fixture: ComponentFixture<DateParseInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateParseInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DateParseInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

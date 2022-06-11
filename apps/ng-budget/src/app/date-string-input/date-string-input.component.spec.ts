import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DateStringInputComponent } from './date-string-input.component';

describe('DateStringInputComponent', () => {
  let component: DateStringInputComponent;
  let fixture: ComponentFixture<DateStringInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateStringInputComponent],
      imports: [ReactiveFormsModule, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DateStringInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

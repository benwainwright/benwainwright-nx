import { Component, Input, OnInit } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';

@Component({
  selector: 'benwainwright-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css'],
})
export class DatePickerComponent implements OnInit {
  @Input()
  id = '';

  @Input()
  label = '';

  @Input()
  placeholder = '';

  @Input()
  control = '';

  public form: FormGroup = new FormGroup({});

  constructor(private controlContainer: ControlContainer) {}

  ngOnInit(): void {
    this.form = <FormGroup>this.controlContainer.control;
  }
}

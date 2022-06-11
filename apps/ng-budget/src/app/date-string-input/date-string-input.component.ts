import { Component, Input, OnInit } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';
import {
  GetDatesResult,
  getNextParsedDate,
  parseDates,
} from '@benwainwright/nl-dates';

@Component({
  selector: 'benwainwright-date-string-input',
  templateUrl: './date-string-input.component.html',
  styleUrls: ['./date-string-input.component.css'],
})
export class DateStringInputComponent implements OnInit {
  @Input()
  id = '';

  @Input()
  label = '';

  @Input()
  getDatesResult: GetDatesResult | undefined;

  @Input()
  placeholder = '';

  @Input()
  control = '';

  public form: FormGroup = new FormGroup({});

  public result: GetDatesResult | undefined;
  public next: Date | undefined;

  constructor(private controlContainer: ControlContainer) {}

  private parseInput(text: string) {
    this.result = parseDates(text);
    this.next = getNextParsedDate(new Date(Date.now()), text);
  }

  fieldChange(event: { target: HTMLInputElement }) {
    this.parseInput(event.target.value);
  }

  ngOnInit(): void {
    this.form = <FormGroup>this.controlContainer.control;

    const control = this.form.get(this.control);
    control?.valueChanges.subscribe((listen) => {
      this.parseInput(listen);
    });
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';

@Component({
  selector: 'benwainwright-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
})
export class InputComponent implements OnInit {
  @Input()
  id = '';

  @Input()
  label = '';

  @Input()
  type = '';

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

import { Component, Input, OnInit } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';

export interface SelectItem {
  label: string
  value: string
}

@Component({
  selector: 'benwainwright-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css'],
})

export class SelectComponent implements OnInit {
  @Input()
  id = ''

  @Input()
  label = ''

  @Input()
  control = '';

  @Input()
  items: SelectItem[] = []

  public form: FormGroup = new FormGroup({});

  public constructor(private controlContainer: ControlContainer) {}

  public ngOnInit(): void {
    this.form = <FormGroup>this.controlContainer.control;
  }
}

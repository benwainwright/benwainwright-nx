import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'benwainwright-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  @Input() public items: {
    path: string;
    navLabel: string;
  }[] = [];
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
}

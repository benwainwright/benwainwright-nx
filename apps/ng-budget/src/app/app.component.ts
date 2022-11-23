import { Component, OnInit } from '@angular/core';
import { menuItems, routes } from './app-routing.module';

@Component({
  selector: 'benwainwright-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'budget';

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public constructor() {}

  public menuItems = menuItems;
}

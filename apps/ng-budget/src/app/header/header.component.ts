import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'benwainwright-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @Input() public items: {
    path: string;
    navLabel: string;
    icon?: string;
  }[] = [];
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}

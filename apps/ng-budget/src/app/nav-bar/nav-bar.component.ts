import { Component, Input } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'benwainwright-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent {
  @Input() public items: {
    path: string;
    navLabel: string;
    icon?: string;
  }[] = [];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}

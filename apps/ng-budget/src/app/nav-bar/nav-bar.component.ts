import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'benwainwright-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}

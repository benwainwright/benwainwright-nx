import { BreakpointObserver } from '@angular/cdk/layout';
import { Component } from '@angular/core';

@Component({
  selector: 'benwainwright-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'budget';

  public constructor(private breakpointObserver: BreakpointObserver) {}
  public mobile = false;

  toggleNav() {
    this.mobile = !this.mobile;
  }

  ngOnInit(): void {
    this.breakpointObserver
      .observe('(max-width: 599px)')
      .subscribe((observer) => {
        this.mobile = observer.matches;
      });
  }
}

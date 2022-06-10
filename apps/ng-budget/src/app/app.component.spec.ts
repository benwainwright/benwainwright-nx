import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';

const bootstrapAppComponent = () => {
  TestBed.configureTestingModule({
    declarations: [NavBarComponent],
    providers: [AppComponent],
  }).compileComponents();

  return TestBed.inject(AppComponent);
};

describe('The app component', () => {
  it('should render', async () => {
    const app = bootstrapAppComponent();

    expect(app).toBeTruthy();
  });
});

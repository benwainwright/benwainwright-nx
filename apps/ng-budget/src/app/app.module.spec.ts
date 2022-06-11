import { TestBed } from '@angular/core/testing';
import { AppModule } from './app.module';
import { APP_BASE_HREF } from '@angular/common';

describe('The app module', () => {
  it('should render without error', async () => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
    });

    const app = TestBed.inject(AppModule);
    expect(app).toBeTruthy();
  });
});

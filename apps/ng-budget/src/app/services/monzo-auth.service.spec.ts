import { TestBed } from '@angular/core/testing';

import { MonzoAuthService } from './monzo-auth.service';

describe('MonzoAuthService', () => {
  let service: MonzoAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonzoAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

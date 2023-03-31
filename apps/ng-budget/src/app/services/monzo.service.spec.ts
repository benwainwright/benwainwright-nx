import { TestBed } from '@angular/core/testing';

import { MonzoService } from './monzo.service';

describe('MonzoService', () => {
  let service: MonzoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonzoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

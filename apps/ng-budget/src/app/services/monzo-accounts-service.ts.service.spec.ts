import { TestBed } from '@angular/core/testing';

import { MonzoAccountsService.TsService } from './monzo-accounts-service.ts.service';

describe('MonzoAccountsService.TsService', () => {
  let service: MonzoAccountsService.TsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonzoAccountsService.TsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

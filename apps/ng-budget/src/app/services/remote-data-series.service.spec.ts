import { TestBed } from '@angular/core/testing';

import { RemoteDataSeries.Service.TsService } from '../remote-data-series.service.ts.service';

describe('RemoteDataSeries.Service.TsService', () => {
  let service: RemoteDataSeries.Service.TsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoteDataSeries.Service.TsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

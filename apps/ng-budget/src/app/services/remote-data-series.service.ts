import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RemoteDataSeriesService<T extends { id: string }> {

  constructor() { }
}

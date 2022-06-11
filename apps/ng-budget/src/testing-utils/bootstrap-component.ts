import { APP_BASE_HREF } from '@angular/common';
import { ProviderToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

export const bootstrapComponent = <T>(component: ProviderToken<T>) => {
  TestBed.configureTestingModule({
    declarations: [component],
    providers: [{ provide: APP_BASE_HREF, useValue: '/' }, component],

    imports: [RouterModule.forRoot([])],
  }).compileComponents();

  return TestBed.inject(component);
};

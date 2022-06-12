import { APP_BASE_HREF } from '@angular/common';
import { ProviderToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ControlContainer,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

export const bootstrapComponent = <T>(
  component: ProviderToken<T>,
  providers: ProviderToken<unknown>[] = []
) => {
  TestBed.configureTestingModule({
    declarations: [component],
    providers: [
      { provide: APP_BASE_HREF, useValue: '/' },
      component,
      ControlContainer,
      ...providers,
    ],

    imports: [RouterModule.forRoot([]), FormsModule, ReactiveFormsModule],
  }).compileComponents();

  return TestBed.inject(component);
};

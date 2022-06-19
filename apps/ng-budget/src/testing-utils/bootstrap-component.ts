import { APP_BASE_HREF } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Provider, ProviderToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ControlContainer,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

export const bootstrapComponent = async <T>(
  component: ProviderToken<T>,
  providers: Provider[] = []
) => {
  await TestBed.configureTestingModule({
    declarations: [component],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
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

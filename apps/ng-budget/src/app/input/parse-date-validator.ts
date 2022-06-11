import { AbstractControl } from '@angular/forms';
import { parseDates } from '@benwainwright/nl-dates';

export function validateDateString(control: AbstractControl) {
  if (parseDates(control.value).type === 'None') {
    return { invalidDateString: true };
  }
  return null;
}

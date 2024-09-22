import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[dateFutureDirective]',
  providers: [{ provide: NG_VALIDATORS, useExisting: dateFutureDirective, multi: true }]
})
export class dateFutureDirective implements Validator {

  validate(control: AbstractControl): ValidationErrors | null {
    const isValid: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        
      if (!control.value) {
        return null
      }

      const inputDate = new Date(control.value).setHours(0,0,0,0);
      const currentDate = new Date().setHours(0,0,0,0)

      console.log("hits")
      if (inputDate > currentDate) {
          return { 'futureDate': true }; 
        } else {
          return null; 
      }
    };

    return isValid(control);
  }
}

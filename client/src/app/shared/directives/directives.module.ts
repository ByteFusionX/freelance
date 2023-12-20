import { NgModule } from '@angular/core';
import { appNoLeadingSpace } from './trim-validator.directive';
import { datePastDirective } from './date-validator.directive';

@NgModule({
    imports: [],
    exports: [appNoLeadingSpace,datePastDirective],
    declarations: [appNoLeadingSpace , datePastDirective],
    providers: [],
})
export class directiveSharedModule { }

import { NgModule } from '@angular/core';
import { appNoLeadingSpace } from './trim-validator.directive';
import { datePastDirective } from './date-validator.directive';
import { appFileValidator } from './file-validator.directive';

@NgModule({
    imports: [],
    exports: [appNoLeadingSpace, datePastDirective, appFileValidator],
    declarations: [appNoLeadingSpace, datePastDirective, appFileValidator],
    providers: [],
})
export class directiveSharedModule { }

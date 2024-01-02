import { NgModule } from '@angular/core';
import { appNoLeadingSpace } from './trim-validator.directive';
import { datePastDirective } from './date-validator.directive';
import { appFileValidator } from './file-validator.directive';
import { dateFutureDirective } from './date-future.directive';

@NgModule({
    imports: [],
    exports: [appNoLeadingSpace, datePastDirective, appFileValidator,dateFutureDirective],
    declarations: [appNoLeadingSpace, datePastDirective, appFileValidator,dateFutureDirective],
    providers: [],
})
export class directiveSharedModule { }

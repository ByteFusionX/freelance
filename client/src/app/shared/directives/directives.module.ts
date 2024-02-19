import { NgModule } from '@angular/core';
import { appNoLeadingSpace } from './trim-validator.directive';
import { datePastDirective } from './date-validator.directive';
import { appFileValidator } from './file-validator.directive';
import { dateFutureDirective } from './date-future.directive';
import { appFileSizeValidator } from './file-size.directive';
import { NegativeNumberDirective } from './negative-validator.directive';


@NgModule({
    imports: [],
    exports: [appNoLeadingSpace, datePastDirective, appFileValidator,dateFutureDirective,appFileSizeValidator,NegativeNumberDirective],
    declarations: [appNoLeadingSpace, datePastDirective, appFileValidator,dateFutureDirective,appFileSizeValidator,NegativeNumberDirective],
    providers: [],
})
export class directiveSharedModule { }

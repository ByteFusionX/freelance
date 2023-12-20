import { NgModule } from '@angular/core';
import { appNoLeadingSpace } from './trim-validator.directive';

@NgModule({
    imports: [],
    exports: [appNoLeadingSpace],
    declarations: [appNoLeadingSpace],
    providers: [],
})
export class directiveSharedModule { }

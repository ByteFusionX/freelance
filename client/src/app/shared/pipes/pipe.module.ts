import { NgModule } from '@angular/core';


import { ParseBoldTextPipe } from './boldParse.pipe';
import { ParseBracketsTextPipe } from './highlightParse.pipe';

@NgModule({
    imports: [],
    exports: [ParseBoldTextPipe,ParseBracketsTextPipe],
    declarations: [ParseBoldTextPipe,ParseBracketsTextPipe],
    providers: [],
})
export class pipeModule { }

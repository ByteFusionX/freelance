import { NgModule } from '@angular/core';


import { ParseBoldTextPipe } from './boldParse.pipe';
import { ParseBracketsTextPipe } from './highlightParse.pipe';
import { NumberFormatterPipe } from './numFormatter.pipe';

@NgModule({
    imports: [],
    exports: [ParseBoldTextPipe,ParseBracketsTextPipe,NumberFormatterPipe],
    declarations: [ParseBoldTextPipe,ParseBracketsTextPipe,NumberFormatterPipe],
    providers: [],
})
export class pipeModule { }

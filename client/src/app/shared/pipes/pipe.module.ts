import { NgModule } from '@angular/core';


import { ParseBoldTextPipe } from './boldParse.pipe';
import { ParseBracketsTextPipe } from './highlightParse.pipe';
import { NumberFormatterPipe } from './numFormatter.pipe';
import { FormatStringPipe } from './formatString.pipe';

@NgModule({
    imports: [],
    exports: [ParseBoldTextPipe,ParseBracketsTextPipe,NumberFormatterPipe,FormatStringPipe],
    declarations: [ParseBoldTextPipe,ParseBracketsTextPipe,NumberFormatterPipe,FormatStringPipe],
    providers: [],
})
export class pipeModule { }

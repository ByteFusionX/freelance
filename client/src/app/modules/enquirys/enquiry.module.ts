import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnquiryRoutingModule } from './enquiry-routing.module';
import { EnquiryComponent } from './enquiry.component';


@NgModule({
  declarations: [
    EnquiryComponent
  ],
  imports: [
    CommonModule,
    EnquiryRoutingModule
  ]
})
export class EnquiryModule { }

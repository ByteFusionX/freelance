import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuotationsRoutingModule } from './quotations-routing.module';
import { QuotationsComponent } from './quotations.component';


@NgModule({
  declarations: [
    QuotationsComponent
  ],
  imports: [
    CommonModule,
    QuotationsRoutingModule
  ]
})
export class QuotationsModule { }

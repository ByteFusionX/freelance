import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnquiryRoutingModule } from './enquiry-routing.module';
import { EnquiryComponent } from './enquiry.component';
import { MatTableModule } from '@angular/material/table';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { CreateEnquiryDialog } from './create-enquiry/create-enquiry.component';
import {  MatDialogModule } from '@angular/material/dialog';
import {MatDatepickerModule} from '@angular/material/datepicker'; 
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatNativeDateModule} from '@angular/material/core';
import { NgIconsModule } from '@ng-icons/core';
// import { MatMomentDateModule } from "@angular/material-moment-adapter";


@NgModule({
  declarations: [
    EnquiryComponent,
    CreateEnquiryDialog
  ],
  imports: [
    CommonModule,
    EnquiryRoutingModule,
    MatTableModule,
    IconsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    NgIconsModule,
  ]
})
export class EnquiryModule { }

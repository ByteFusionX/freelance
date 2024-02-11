import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnquiryRoutingModule } from './enquiry-routing.module';
import { EnquiryComponent } from './enquiry.component';
import { MatTableModule } from '@angular/material/table';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { CreateEnquiryDialog } from './create-enquiry/create-enquiry.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { NgIconsModule } from '@ng-icons/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { directiveSharedModule } from 'src/app/shared/directives/directives.module';
import { SkeltonLoadingComponent } from 'src/app/shared/components/skelton-loading/skelton-loading.component';
import { AssignPresaleComponent } from './assign-presale/assign-presale.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UploadFileComponent } from 'src/app/shared/components/upload-file/upload-file.component';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';

@NgModule({
  declarations: [
    EnquiryComponent,
    CreateEnquiryDialog,
    AssignPresaleComponent
  ],
  imports: [
    CommonModule,
    EnquiryRoutingModule,
    MatTableModule,
    IconsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatNativeDateModule,
    NgIconsModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
    directiveSharedModule,
    FormsModule,
    SkeltonLoadingComponent,
    UploadFileComponent,
    PaginationComponent
  ],
  providers: []
})
export class EnquiryModule { }

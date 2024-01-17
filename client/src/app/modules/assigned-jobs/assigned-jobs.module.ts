import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignedJobsRoutingModule } from './assigned-jobs-routing.module';
import { AssignedJobsComponent } from './assigned-jobs.component';
import { AssignedJobsListComponent } from './pages/assigned-jobs-list/assigned-jobs-list.component';
import { MatTableModule } from '@angular/material/table';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { SkeltonLoadingComponent } from 'src/app/shared/components/skelton-loading/skelton-loading.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UploadFileComponent } from 'src/app/shared/components/upload-file/upload-file.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FileUploadComponent } from './pages/file-upload/file-upload.component';

@NgModule({
  declarations: [
    AssignedJobsComponent,
    AssignedJobsListComponent,
    FileUploadComponent
  ],
  imports: [
    CommonModule,
    AssignedJobsRoutingModule,
    MatTableModule,
    IconsModule,
    SkeltonLoadingComponent,
    MatTooltipModule,
    UploadFileComponent,
    MatDialogModule
  ]
})
export class AssignedJobsModule { }

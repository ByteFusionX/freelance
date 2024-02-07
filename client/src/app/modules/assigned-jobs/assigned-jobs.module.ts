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
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { MatMenuModule } from '@angular/material/menu';
import {MatDividerModule} from '@angular/material/divider';

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
    MatDialogModule,
    PaginationComponent,
    MatMenuModule,
    MatDividerModule,
  ]
})
export class AssignedJobsModule { }

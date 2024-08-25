import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignedJobsRoutingModule } from './assigned-jobs-routing.module';
import { AssignedJobsComponent } from './assigned-jobs.component';
import { AssignedJobsListComponent } from './pages/assigned-jobs-list/assigned-jobs-list.component';
import { CompletedJobsListComponent } from './pages/completed-jobs-list/completed-jobs-list.component';
import { MatTableModule } from '@angular/material/table';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { SkeltonLoadingComponent } from 'src/app/shared/components/skelton-loading/skelton-loading.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UploadFileComponent } from 'src/app/shared/components/upload-file/upload-file.component';
import { MatDialogModule } from '@angular/material/dialog';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { MatMenuModule } from '@angular/material/menu';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDividerModule} from '@angular/material/divider';
import { ViewCommentComponent } from './pages/view-comment/view-comment.component';
import { SelectEmployeeComponent } from './pages/select-employee/select-employee.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ViewFeedbackComponent } from './pages/view-feedback/view-feedback.component';
import { UploadEstimationComponent } from './pages/upload-estimation/upload-estimation.component';
import { ViewEstimationComponent } from './pages/view-estimation/view-estimation.component';
import { pipeModule } from "../../shared/pipes/pipe.module";

@NgModule({
  declarations: [
    AssignedJobsComponent,
    AssignedJobsListComponent,
    CompletedJobsListComponent,
    ViewCommentComponent,
    SelectEmployeeComponent,
    ViewFeedbackComponent,
    UploadEstimationComponent,
    ViewEstimationComponent
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
    MatProgressBarModule,
    MatDividerModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    pipeModule
]
})
export class AssignedJobsModule { }

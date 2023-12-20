import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobsRoutingModule } from './jobs-routing.module';
import { JobsComponent } from './jobs.component';
import { AssignedJobsComponent } from './pages/assigned-jobs/assigned-jobs.component';
import { JobsSheetComponent } from './pages/jobs-sheet/jobs-sheet.component';


@NgModule({
  declarations: [
    JobsComponent,
    AssignedJobsComponent,
    JobsSheetComponent
  ],
  imports: [
    CommonModule,
    JobsRoutingModule,
  ]
})
export class JobsModule { }

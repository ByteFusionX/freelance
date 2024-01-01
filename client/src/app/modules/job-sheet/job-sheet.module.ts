import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobSheetRoutingModule } from './job-sheet-routing.module';
import { JobSheetComponent } from './job-sheet.component';
import { JobListComponent } from './pages/job-list/job-list.component';


@NgModule({
  declarations: [
    JobSheetComponent,
    JobListComponent
  ],
  imports: [
    CommonModule,
    JobSheetRoutingModule
  ]
})
export class JobSheetModule { }

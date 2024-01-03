import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignedJobsRoutingModule } from './assigned-jobs-routing.module';
import { AssignedJobsComponent } from './assigned-jobs.component';
import { AssignedJobsListComponent } from './pages/assigned-jobs-list/assigned-jobs-list.component';
import { MatTableModule } from '@angular/material/table';
import { IconsModule } from 'src/app/lib/icons/icons.module';


@NgModule({
  declarations: [
    AssignedJobsComponent,
    AssignedJobsListComponent
  ],
  imports: [
    CommonModule,
    AssignedJobsRoutingModule,
    MatTableModule,
    IconsModule,
    
  ]
})
export class AssignedJobsModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobSheetRoutingModule } from './job-sheet-routing.module';
import { JobSheetComponent } from './job-sheet.component';
import { JobListComponent } from './pages/job-list/job-list.component';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@NgModule({
  declarations: [
    JobSheetComponent,
    JobListComponent
  ],
  imports: [
    CommonModule,
    JobSheetRoutingModule,
    IconsModule,
    MatTableModule,
    MatMenuModule,
    NgSelectModule,
    FormsModule,
    MatTooltipModule,
    MatProgressBarModule
  ]
})
export class JobSheetModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobSheetRoutingModule } from './job-sheet-routing.module';
import { JobSheetComponent } from './job-sheet.component';
import { JobListComponent } from './pages/job-list/job-list.component';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SkeltonLoadingComponent } from 'src/app/shared/components/skelton-loading/skelton-loading.component';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { GenerateReportComponent } from 'src/app/shared/components/generate-report/generate-report.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';



@NgModule({
  declarations: [
    JobSheetComponent,
    JobListComponent,
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
    SkeltonLoadingComponent,
    PaginationComponent,
    MatProgressBarModule,
    ReactiveFormsModule,
    GenerateReportComponent,
    NgxExtendedPdfViewerModule,
  ]
})
export class JobSheetModule { }

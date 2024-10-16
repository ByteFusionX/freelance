import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { QuotationsRoutingModule } from './quotations-routing.module';
import { QuotationsComponent } from './quotations.component';
import { CreateQuotatationComponent } from './pages/create-quotatation/create-quotatation.component';
import { QuotationListComponent } from './pages/quotation-list/quotation-list.component';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IconsModule } from 'src/app/lib/icons/icons.module';
import { MatMenuModule } from '@angular/material/menu';
import { QuotationViewComponent } from './pages/quotation-view/quotation-view.component';
import { QuotationEditComponent } from './pages/quotation-edit/quotation-edit.component';
import { directiveSharedModule } from 'src/app/shared/directives/directives.module';
import { SkeltonLoadingComponent } from 'src/app/shared/components/skelton-loading/skelton-loading.component';
import { UploadLpoComponent } from './pages/upload-lpo/upload-lpo.component';
import { UploadFileComponent } from "../../shared/components/upload-file/upload-file.component";
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { ResizableModule } from 'src/app/shared/components/resizable/resizable.module';
import { pipeModule } from 'src/app/shared/pipes/pipe.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DealFormComponent } from './pages/deal-form/deal-form.component';
import { ViewLpoComponent } from './pages/view-lpo/view-lpo.component';
import { ViewReportComponent } from './pages/view-report/view-report.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@NgModule({
    declarations: [
        QuotationsComponent,
        CreateQuotatationComponent,
        QuotationListComponent,
        QuotationViewComponent,
        QuotationEditComponent,
        UploadLpoComponent,
        DealFormComponent,
        ViewLpoComponent,
        ViewReportComponent,
    ],
    providers: [DatePipe],
    imports: [
        CommonModule,
        QuotationsRoutingModule,
        MatTableModule,
        MatDialogModule,
        NgSelectModule,
        FormsModule,
        IconsModule,
        MatMenuModule,
        FormsModule,
        ReactiveFormsModule,
        directiveSharedModule,
        SkeltonLoadingComponent,
        UploadFileComponent,
        PaginationComponent,
        ResizableModule,
        pipeModule,
        MatTooltipModule,
        NgApexchartsModule,
        MatSnackBarModule
    ]
})
export class QuotationsModule { }

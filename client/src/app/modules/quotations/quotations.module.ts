import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuotationsRoutingModule } from './quotations-routing.module';
import { QuotationsComponent } from './quotations.component';
import { CreateQuotatationComponent } from './pages/create-quotatation/create-quotatation.component';
import { QuotationListComponent } from './pages/quotation-list/quotation-list.component';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { MatMenuModule } from '@angular/material/menu';
import { QuotationViewComponent } from './pages/quotation-view/quotation-view.component';
import { QuotationEditComponent } from './pages/quotation-edit/quotation-edit.component';


@NgModule({
  declarations: [
    QuotationsComponent,
    CreateQuotatationComponent,
    QuotationListComponent,
    QuotationViewComponent,
    QuotationEditComponent
  ],
  imports: [
    CommonModule,
    QuotationsRoutingModule,
    MatTableModule,
    MatDialogModule,
    NgSelectModule,
    FormsModule,
    IconsModule,
    MatMenuModule,
  ]
})
export class QuotationsModule { }

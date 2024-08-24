import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealSheetComponent } from './deal-sheet.component';
import { SkeltonLoadingComponent } from 'src/app/shared/components/skelton-loading/skelton-loading.component';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { DealSheetRoutingModule } from './deal-sheet-routing.module';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApproveDealComponent } from './approve-deal/approve-deal.component';
import { pipeModule } from "../../shared/pipes/pipe.module";
import { RejectDealComponent } from './reject-deal/reject-deal.component';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    DealSheetComponent,
    ApproveDealComponent,
    RejectDealComponent,
  ],
  imports: [
    CommonModule,
    DealSheetRoutingModule,
    SkeltonLoadingComponent,
    MatTableModule,
    MatDialogModule,
    PaginationComponent,
    IconsModule,
    MatTooltipModule,
    pipeModule,
    ReactiveFormsModule
]
})
export class DealSheetModule { }

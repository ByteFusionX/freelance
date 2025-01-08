import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecycleRoutingModule } from './recycle-routing.module';
import { RecycleComponent } from './recycle.component';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SkeltonLoadingComponent } from 'src/app/shared/components/skelton-loading/skelton-loading.component';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@NgModule({
  declarations: [RecycleComponent],
  imports: [
    CommonModule,
    RecycleRoutingModule,
    IconsModule,
    MatTableModule,
    MatTooltipModule,
    SkeltonLoadingComponent,
    PaginationComponent,
    MatProgressBarModule,
  ]
})
export class RecycleModule { }

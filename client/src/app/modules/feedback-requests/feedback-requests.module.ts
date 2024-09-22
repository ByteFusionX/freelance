import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackRequestsComponent } from './feedback-requests.component';
import { FeedbackRequestsRoutingModule } from './feedback-requests-routing.module';
import { SkeltonLoadingComponent } from "../../shared/components/skelton-loading/skelton-loading.component";
import { MatTableModule } from '@angular/material/table';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { GiveFeedbackComponent } from './pages/give-feedback/give-feedback.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    FeedbackRequestsComponent,
    GiveFeedbackComponent
  ],
  imports: [
    CommonModule,
    FeedbackRequestsRoutingModule,
    SkeltonLoadingComponent,
    MatTableModule,
    IconsModule,
    MatTooltipModule,
    PaginationComponent,
    FormsModule
]
})
export class FeedbackRequestsModule { }

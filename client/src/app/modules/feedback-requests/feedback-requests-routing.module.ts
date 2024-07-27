import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeedbackRequestsComponent } from './feedback-requests.component';


const routes: Routes = [
  {
    path: '', component: FeedbackRequestsComponent, 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeedbackRequestsRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignedJobsComponent } from './assigned-jobs.component';
import { AssignedJobsListComponent } from './pages/assigned-jobs-list/assigned-jobs-list.component';
import { CompletedJobsListComponent } from './pages/completed-jobs-list/completed-jobs-list.component';
import { UploadEstimationComponent } from './pages/upload-estimation/upload-estimation.component';

const routes: Routes = [
  {
    path: '', component: AssignedJobsComponent,
    children: [
      { path: '', component: AssignedJobsListComponent },
      { path: 'upload-estimations', component: UploadEstimationComponent },
      { path: 'edit-estimations', component: UploadEstimationComponent },
      { path: 'completed', component: CompletedJobsListComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignedJobsRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignedJobsComponent } from './assigned-jobs.component';
import { AssignedJobsListComponent } from './pages/assigned-jobs-list/assigned-jobs-list.component';
import { CompletedJobsListComponent } from './pages/completed-jobs-list/completed-jobs-list.component';

const routes: Routes = [
  {
    path: '', component: AssignedJobsComponent,
    children: [
      { path: '', component: AssignedJobsListComponent },
      { path: 'completed', component: CompletedJobsListComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignedJobsRoutingModule { }

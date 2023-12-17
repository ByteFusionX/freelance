import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobsComponent } from './jobs.component';
import { AssignedJobsComponent } from './pages/assigned-jobs/assigned-jobs.component';
import { JobsSheetComponent } from './pages/jobs-sheet/jobs-sheet.component';

const routes: Routes = [
  {
    path: '', component: JobsComponent,
    children: [
      { path: 'assign', component: AssignedJobsComponent },
      { path: 'sheet', component: JobsSheetComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobsRoutingModule { }

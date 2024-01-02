import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobSheetComponent } from './job-sheet.component';
import { JobListComponent } from './pages/job-list/job-list.component';

const routes: Routes = [
  {
    path: '', component: JobSheetComponent,
    children: [
      { path: '', component: JobListComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobSheetRoutingModule { }

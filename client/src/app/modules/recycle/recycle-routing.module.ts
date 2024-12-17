import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecycleComponent } from './recycle.component';

const routes: Routes = [
  { path: '', component: RecycleComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecycleRoutingModule { }

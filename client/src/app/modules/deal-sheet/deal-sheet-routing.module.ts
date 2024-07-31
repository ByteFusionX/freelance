import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DealSheetComponent } from './deal-sheet.component';

const routes: Routes = [
  {
    path: '', component: DealSheetComponent,
    children: [
      { path: '', component: DealSheetComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DealSheetRoutingModule { }

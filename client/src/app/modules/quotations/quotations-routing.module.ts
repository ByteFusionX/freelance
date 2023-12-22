import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuotationsComponent } from './quotations.component';
import { QuotationListComponent } from './pages/quotation-list/quotation-list.component';

const routes: Routes = [
  {
    path: '', component: QuotationsComponent, children: [
      { path: '', component: QuotationListComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotationsRoutingModule { }

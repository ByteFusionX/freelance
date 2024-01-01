import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuotationsComponent } from './quotations.component';
import { QuotationListComponent } from './pages/quotation-list/quotation-list.component';
import { CreateQuotatationComponent } from './pages/create-quotatation/create-quotatation.component';

const routes: Routes = [
  {
    path: '', component: QuotationsComponent, children: [
      { path: '', component: QuotationListComponent },
      { path: 'create-quote', component:CreateQuotatationComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotationsRoutingModule { }

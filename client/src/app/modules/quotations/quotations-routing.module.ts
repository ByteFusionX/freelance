import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuotationsComponent } from './quotations.component';
import { QuotationListComponent } from './pages/quotation-list/quotation-list.component';
import { CreateQuotatationComponent } from './pages/create-quotatation/create-quotatation.component';
import { QuotationEditComponent } from './pages/quotation-edit/quotation-edit.component';
import { QuotationViewComponent } from './pages/quotation-view/quotation-view.component';

const routes: Routes = [
  {
    path: '', component: QuotationsComponent, children: [
      { path: '', component: QuotationListComponent },
      { path: 'create', component:CreateQuotatationComponent},
      { path: 'edit', component:QuotationEditComponent},
      { path: 'view', component:QuotationViewComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotationsRoutingModule { }

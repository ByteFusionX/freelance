import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuotationsComponent } from './quotations.component';
import { QuotationListComponent } from './pages/quotation-list/quotation-list.component';
import { CreateQuotatationComponent } from './pages/create-quotatation/create-quotatation.component';
import { QuotationEditComponent } from './pages/quotation-edit/quotation-edit.component';
import { QuotationViewComponent } from './pages/quotation-view/quotation-view.component';
import { RoleGuard } from 'src/app/core/guards/role/role.guard';

const routes: Routes = [
  {
    path: '', component: QuotationsComponent, children: [
      { path: '',canActivate:[RoleGuard], component: QuotationListComponent },
      { path: 'report',canActivate:[RoleGuard], component: QuotationListComponent },
      { path: 'create',canActivate:[RoleGuard],  component:CreateQuotatationComponent},
      { path: 'edit',canActivate:[RoleGuard],  component:QuotationEditComponent},
      { path: 'view',canActivate:[RoleGuard],  component:QuotationViewComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotationsRoutingModule { }

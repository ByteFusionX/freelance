import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomersComponent } from './customers.component';
import { CustomersListComponent } from './pages/customers-list/customers-list.component';
import { CreateCustomerDialog } from './pages/create-customer/create-customer.component';
import { CustomerViewComponent } from './pages/customer-view/customer-view.component';
import { CustomerEditComponent } from './pages/customer-edit/customer-edit.component';

const routes: Routes = [
  {
    path: '', component: CustomersComponent, 
    children: [
      { path: '', component: CustomersListComponent },
      { path:'create',component:CreateCustomerDialog},
      { path:'view',component:CustomerViewComponent},
      { path:'edit',component:CustomerEditComponent}

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomersComponent } from './customers.component';
import { CustomersListComponent } from './pages/customers-list/customers-list.component';

const routes: Routes = [
  {
    path: '', component: CustomersComponent, 
    children: [
      { path: '', component: CustomersListComponent, }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }

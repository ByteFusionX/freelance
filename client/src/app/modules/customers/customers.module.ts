import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomersRoutingModule } from './customers-routing.module';
import { NgIconsModule } from '@ng-icons/core';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { CustomersListComponent } from './pages/customers-list/customers-list.component';
import { CreateCustomerDialog } from './pages/create-customer/create-customer.component';


@NgModule({
  declarations: [
    CustomersListComponent,
    CreateCustomerDialog
  ],
  imports: [
    CommonModule,
    CustomersRoutingModule,
    NgIconsModule, 
    MatTableModule,
    MatDialogModule
  ]
})
export class CustomersModule { }

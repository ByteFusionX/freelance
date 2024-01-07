import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomersRoutingModule } from './customers-routing.module';
import { NgIconsModule } from '@ng-icons/core';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { CustomersListComponent } from './pages/customers-list/customers-list.component';
import { CreateCustomerDialog } from './pages/create-customer/create-customer.component';
import { directiveSharedModule } from 'src/app/shared/directives/directives.module';
import { ReactiveFormsModule } from '@angular/forms';


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
    MatDialogModule,
    directiveSharedModule,
    ReactiveFormsModule
  ]
})
export class CustomersModule { }

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
import { SkeltonLoadingComponent } from 'src/app/shared/components/skelton-loading/skelton-loading.component';
import { CustomerViewComponent } from './pages/customer-view/customer-view.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CustomersComponent } from './customers.component';


@NgModule({
  declarations: [
    CustomersComponent,
    CustomersListComponent,
    CreateCustomerDialog,
    CustomerViewComponent
  ],
  imports: [
    CommonModule,
    CustomersRoutingModule,
    NgIconsModule, 
    MatTableModule,
    MatDialogModule,
    directiveSharedModule,
    ReactiveFormsModule,
    SkeltonLoadingComponent,
    MatPaginatorModule
  ]
})
export class CustomersModule { }

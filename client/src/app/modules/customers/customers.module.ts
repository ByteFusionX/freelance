import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomersRoutingModule } from './customers-routing.module';
import { NgIconsModule } from '@ng-icons/core';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { CustomersListComponent } from './pages/customers-list/customers-list.component';
import { CreateCustomerDialog } from './pages/create-customer/create-customer.component';
import { directiveSharedModule } from 'src/app/shared/directives/directives.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SkeltonLoadingComponent } from 'src/app/shared/components/skelton-loading/skelton-loading.component';
import { CustomerViewComponent } from './pages/customer-view/customer-view.component';
import { CustomersComponent } from './customers.component';
import { CustomerEditComponent } from './pages/customer-edit/customer-edit.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { pipeModule } from 'src/app/shared/pipes/pipe.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    CustomersComponent,
    CustomersListComponent,
    CreateCustomerDialog,
    CustomerViewComponent,
    CustomerEditComponent
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
    FormsModule,
    NgSelectModule,
    PaginationComponent,
    pipeModule,
    SharedModule, 
  ]
})
export class CustomersModule { }

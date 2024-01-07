import { Component } from '@angular/core';
import { CreateCustomerDialog } from '../create-customer/create-customer.component';
import { getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { MatTableDataSource } from '@angular/material/table';
import { CustomerService } from 'src/app/core/services/customer/customer.service';

@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.css']
})
export class CustomersListComponent {
  customers:getCustomer[] = []
  displayedColumns: string[] = ['position', 'name', 'createdBy', 'department'];
  isLoading:boolean = true;

  dataSource!: MatTableDataSource<getCustomer>;

  constructor(
    private _customerService:CustomerService
  ) { }

  ngOnInit(){
    this.getCustomers()
  }

  ngDoCheck() {
    this.dataSource = new MatTableDataSource(this.customers);
  }

  getCustomers(){
    this._customerService.getCustomers().subscribe((res: getCustomer[]) => {
      this.customers = res;
      this.isLoading = false;
    })
  }


}

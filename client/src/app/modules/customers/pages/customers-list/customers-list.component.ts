import { Component } from '@angular/core';
import { CreateCustomerDialog } from '../create-customer/create-customer.component';
import { getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { MatTableDataSource } from '@angular/material/table';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { NavigationExtras, Router } from '@angular/router';

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
    private _customerService:CustomerService,
    private _router:Router
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

  onCustomer(data: any){
    const navigationExtras: NavigationExtras = {
      state: data
    };
    this._router.navigate(['/customers/view'], navigationExtras);
  }
}

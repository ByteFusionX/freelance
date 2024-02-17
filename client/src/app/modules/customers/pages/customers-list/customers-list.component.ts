import { Component } from '@angular/core';
import { CreateCustomerDialog } from '../create-customer/create-customer.component';
import { getCustomer, getFilteredCustomer } from 'src/app/shared/interfaces/customer.interface';
import { MatTableDataSource } from '@angular/material/table';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { NavigationExtras, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { getCreators, getEmployee } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.css']
})
export class CustomersListComponent {

  employees$!: Observable<getCreators[]>;

  isLoading: boolean = true;
  isEmpty: boolean = false;

  displayedColumns: string[] = ['position', 'name', 'createdBy', 'department'];

  dataSource = new MatTableDataSource<getCustomer>()
  filteredData = new MatTableDataSource<getCustomer>()

  total: number = 0;
  page: number = 1;
  row: number = 10;
  selectedEmployee: string | null = null;

  private subscriptions = new Subscription();
  private subject = new BehaviorSubject<{ page: number, row: number }>({ page: this.page, row: this.row });

  constructor(
    private _customerService: CustomerService,
    private _router: Router
  ) { }

  ngOnInit() {
    this.employees$ = this._customerService.getCustomerCreators()
    this.getAllCustomers()
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  getAllCustomers() {
    let filterData = {
      page: this.page,
      row: this.row,
      createdBy: this.selectedEmployee
    }

    this.subscriptions.add(
      this._customerService.getCustomers(filterData)
        .subscribe((data: getFilteredCustomer) => {
          if (data) {
            this.dataSource.data = [...data.customers];
            this.filteredData.data = data.customers;
            this.total = data.total
            this.isEmpty = false
          } else {
            this.dataSource.data = [];
            this.isEmpty = true;
          }
          this.isLoading = false
        })
    )
  }

  onfilterApplied() {
    this.getAllCustomers()
  }

  onCustomer(data: any) {
    const navigationExtras: NavigationExtras = {
      state: data
    };
    this._router.navigate(['/customers/view'], navigationExtras);
  }

  onPageNumberClick(event: { page: number, row: number }) {
    this.subject.next(event)
  }
}

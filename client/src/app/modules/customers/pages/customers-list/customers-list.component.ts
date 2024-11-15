import { Component } from '@angular/core';
import { CreateCustomerDialog } from '../create-customer/create-customer.component';
import { getCustomer, getFilteredCustomer } from 'src/app/shared/interfaces/customer.interface';
import { MatTableDataSource } from '@angular/material/table';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { NavigationExtras, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { getCreators, getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';

@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.css']
})
export class CustomersListComponent {

  employees$!: Observable<getCreators[]>;

  isLoading: boolean = true;
  isEmpty: boolean = false;
  isEnter: boolean = false;
  createCustomer: boolean | undefined = false;

  displayedColumns: string[] = ['position', 'clientRef', 'name', 'createdBy', 'department'];

  dataSource = new MatTableDataSource<getCustomer>()
  filteredData = new MatTableDataSource<getCustomer>()

  total: number = 0;
  page: number = 1;
  row: number = 10;
  selectedEmployee: string | null = null;
  searchQuery: string = '';

  private subscriptions = new Subscription();
  private subject = new BehaviorSubject<{ page: number, row: number }>({ page: this.page, row: this.row });

  constructor(
    private _customerService: CustomerService,
    private _router: Router,
    private _employeeService: EmployeeService,
  ) { }

  ngOnInit() {
    this.checkPermission()
    this.employees$ = this._customerService.getCustomerCreators();
    this.subscriptions.add(
      this.subject.subscribe((data) => {
        this.page = data.page
        this.row = data.row
        this.getAllCustomers()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  getAllCustomers() {
    this.isLoading = true;
    let access;
    let userId;
    this._employeeService.employeeData$.subscribe((employee) => {
      access = employee?.category.privileges.customer.viewReport
      userId = employee?._id
    })

    let filterData = {
      page: this.page,
      row: this.row,
      createdBy: this.selectedEmployee,
      access: access,
      userId: userId,
      search: this.searchQuery,
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

  ngModelChange() {
    if (this.searchQuery == '' && this.isEnter) {
      this.onSearch();
      this.isEnter = !this.isEnter;
    }
  }

  onSearch() {
    this.isEnter = true
    this.isLoading = true;
    this.getAllCustomers()
  }

  onRowClicks(index: number) {
    let data = this.dataSource.data[index]
    const navigationExtras: NavigationExtras = {
      state: data
    };
    this._router.navigate([`/customers/view/${data.clientRef}`], navigationExtras);
  }

  checkPermission() {
    this._employeeService.employeeData$.subscribe((data) => {
      this.createCustomer = data?.category.privileges.customer.create
    })
  }

  onPageNumberClick(event: { page: number, row: number }) {
    this.subject.next(event)
  }
}

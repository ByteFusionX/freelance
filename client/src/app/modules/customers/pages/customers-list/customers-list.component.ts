import { Component } from '@angular/core';
import { CreateCustomerDialog } from '../create-customer/create-customer.component';
import { getCustomer, getFilteredCustomer } from 'src/app/shared/interfaces/customer.interface';
import { MatTableDataSource } from '@angular/material/table';
import { CustomerService } from 'src/app/core/services/customer/customer.service';
import { NavigationExtras, Router } from '@angular/router';
import { BehaviorSubject, Observable, share, Subscription } from 'rxjs';
import { getCreators, getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { MatDialog } from '@angular/material/dialog';
import { ShareTransferCustomerComponent } from '../share-transfer-customer/share-transfer-customer.component';
import { SharedWithListComponent } from '../shared-with-list/shared-with-list.component';

@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.css']
})
export class CustomersListComponent {

  employees$!: Observable<getCreators[]>;
  userId:string | undefined;
  shareAccess: boolean | undefined = false;
  transferAccess: boolean | undefined = false;
  isLoading: boolean = true;
  isEmpty: boolean = false;
  isEnter: boolean = false;
  createCustomer: boolean | undefined = false;


  displayedColumns: string[] = ['position', 'clientRef', 'name', 'createdBy', 'department', 'share'];
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
    private dialog: MatDialog
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

  preventClick(event: Event) {
    event.stopPropagation()
  }

  getAllCustomers() {
    this.isLoading = true;
    let access;
    let userId;
    this._employeeService.employeeData$.subscribe((employee) => {
      access = employee?.category.privileges.customer.viewReport
      this.shareAccess = employee?.category.privileges.customer.share
      this.transferAccess = employee?.category.privileges.customer.transfer
      this.userId = employee?._id;
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

  onShareOrTransfer(type: String, customerId: string, index: number) {
    const shareDialog = this.dialog.open(ShareTransferCustomerComponent, {
      data: {
        type: type,
        customerId: customerId
      },
      width: '500px'
    })

    shareDialog.afterClosed().subscribe((res) => {
      if (res) {
        this._customerService.shareOrTransferCustomer({
          customerId: customerId,
          employees: res.employees,
          type: res.type
        }).subscribe((res) => {
          this.dataSource.data[index].createdBy = res.createdBy;
          this.dataSource.data[index].sharedWith = res.sharedWith;
          this.dataSource._updateChangeSubscription();
        })
      }
    })
  }

  onSharedList(sharedWith: any, customerId: string, index: number) {
    const shareDialog = this.dialog.open(SharedWithListComponent, {
      data: {
        sharedWith,
        customerId
      },
      disableClose: true,
      width: '500px'
    })

    shareDialog.afterClosed().subscribe((res) => {
      this.dataSource.data[index].sharedWith = res;
      this.dataSource._updateChangeSubscription()
    })
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

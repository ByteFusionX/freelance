import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateEmployeeDialog } from './create-employee/create-employee.component';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { MatTableDataSource } from '@angular/material/table';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription, filter } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent {

  isLoading: boolean = true;
  isEnter: boolean = false;
  isEmpty: boolean = false;
  createEmployee: boolean | undefined = false;

  displayedColumns: string[] = ['employeeId', 'name', 'department', 'email', 'contactNo'];

  dataSource = new MatTableDataSource<getEmployee>()
  filteredData = new MatTableDataSource<getEmployee>()

  total!: number;
  page: number = 1;
  row: number = 10;
  searchQuery: string = ''

  private subscriptions = new Subscription();
  private subject = new BehaviorSubject<{ page: number, row: number }>({ page: this.page, row: this.row });

  constructor(
    public dialog: MatDialog,
    private _employeeService: EmployeeService,
    private _toast: ToastrService,
    private _router: Router,
  ) { }

  ngOnInit() {
    this.checkPermission();
    this.subscriptions.add(
      this.subject.subscribe((data) => {
        this.page = data.page
        this.row = data.row
        this.getEmployees()
      })
    )
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
    this.getEmployees()
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  getEmployees() {
    let access;
    let userId;
    this._employeeService.employeeData$.subscribe((employee) => {
      access = employee?.category.privileges.employee.viewReport
      userId = employee?._id
    })

    let filterData = {
      page: this.page,
      row: this.row,
      search: this.searchQuery,
      access: access,
      userId: userId
    }

    this.subscriptions.add(
      this._employeeService.getEmployees(filterData)
        .subscribe({
          next: (data: { total: number, employees: getEmployee[] }) => {
            if (data) {
              this.dataSource.data = [...data.employees]
              this.filteredData.data = data.employees;
              this.total = data.total
              this.isLoading = false;
              this.isEmpty = false;
            } else {
              this.dataSource.data = [];
              this.isLoading = false;
              this.isEmpty = true;
            }
          }
        })
    )

  }

  openDialog() {
    const dialogRef = this.dialog.open(CreateEmployeeDialog);
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        if (this.dataSource.data.length < 10) {
          this.total++;
          this.dataSource.data.push(data);
          this.dataSource._updateChangeSubscription();
        }
        this._toast.success('Employee Created Successfully')
      }
    });
  }

  onRowClicks(index: number) {
    let data = this.dataSource.data[index]
    const navigationExtras: NavigationExtras = {
      state: data
    };
    this._router.navigate(['/home', 'employees', 'view' , data.employeeId], navigationExtras);
  }

  checkPermission() {
    this._employeeService.employeeData$.subscribe((data) => {
      this.createEmployee = data?.category.privileges.employee.create
    })
  }

  onPageNumberClick(event: { page: number, row: number }) {
    this.subject.next(event)
  }
}

import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateEmployeeDialog } from './create-employee/create-employee.component';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { MatTableDataSource } from '@angular/material/table';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent {

  isLoading: boolean = true;
  isEmpty: boolean = false;

  displayedColumns: string[] = ['employeeId', 'name', 'department', 'email', 'contactNo', 'privilage'];

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
    private _toast: ToastrService
  ) { }

  ngOnInit() {
    this.subscriptions.add(
      this.subject.subscribe((data) => {
        this.page = data.page
        this.row = data.row
        this.getEmployees()
      })
    )
  }

  onSearch() {
    this.isLoading = true;
    this.getEmployees()
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  getEmployees() {
    let filterData = {
      page: this.page,
      row: this.row,
      search: this.searchQuery
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
        this.dataSource.data.push(data)
        this._toast.success('Employee Created Successfully')
      }
    });
  }

  onPageNumberClick(event: { page: number, row: number }) {
    this.subject.next(event)
  }
}

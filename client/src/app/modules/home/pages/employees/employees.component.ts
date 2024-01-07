import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateEmployeeDialog } from './create-employee/create-employee.component';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { MatTableDataSource } from '@angular/material/table';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent {

  employees: getEmployee[] = [];
  displayedColumns: string[] = ['employeeId','name', 'department', 'email', 'contactNo', 'privilage'];
  isLoading: boolean = true;

  dataSource!: MatTableDataSource<getEmployee>;

  constructor(
    public dialog: MatDialog,
    private _employeeService: EmployeeService,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.getEmployees()
  }

  ngDoCheck() {
    this.dataSource = new MatTableDataSource(this.employees);

  }

  getEmployees() {
    this._employeeService.getEmployees().subscribe((res: getEmployee[]) => {
      if(res){
        this.employees = res;
      console.log(this.employees)
      }
      this.isLoading = false;
    })
  }

  openDialog() {
    const dialogRef = this.dialog.open(CreateEmployeeDialog);

    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.employees.push(data)
        this.toast.success('Employee Created Successfully')
      }
    });
  }
}

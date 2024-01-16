import { AfterViewInit, Component, DoCheck, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CreateDepartmentDialog } from '../create-department/create-department.component';
import { Subscription } from 'rxjs';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { getEmployee, getEmployeeObject } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.css'],
})
export class ProfileInfoComponent implements AfterViewInit, OnDestroy {

  depName!: string;
  depHead!: string;
  optionSelected!: string;
  openCreateForm: boolean = false
  employeeData!:getEmployee

  displayedColumns: string[] = ['position', 'name', 'head', 'date', 'action'];
  dataSource: any = new MatTableDataSource()
  private subscriptions = new Subscription();

  constructor(private _profileService: ProfileService,
     public dialog: MatDialog,
     private _employeeService:EmployeeService) { }

  ngOnInit(){
    // const employeeId=localStorage.getItem('employeeId') as string
    this._employeeService.getEmployeeData('NT-1102').subscribe((res:getEmployeeObject)=>{
    this.employeeData = res.employeeData
    })
  }

  ngAfterViewInit() {
    this.subscriptions.add(this._profileService.getDepartments().subscribe((data) => {
      if (data) {
        this.dataSource.data = data
      }
    }))
  }

  onCreateClicks() {
    const dialogRef = this.dialog.open(CreateDepartmentDialog);
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        data.departmentHead = [data.departmentHead]
        this.dataSource.data = [...this.dataSource.data, data]
      }
    });
  }

  onEditClick(index: number) {
    let department = this.dataSource.data[index]
    if (department) {
      const dialogRef = this.dialog.open(CreateDepartmentDialog, { data: department });
      dialogRef.afterClosed().subscribe(data => {
        if (data) {
          data.departmentHead = [data.departmentHead]
          this.dataSource.data[index] = data
          this.dataSource.data = [...this.dataSource.data]
        }
      })
    }
  }

  ngOnDestroy(){
    this.subscriptions.unsubscribe()
  }
}

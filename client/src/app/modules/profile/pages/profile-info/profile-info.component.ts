import { AfterViewInit, Component, DoCheck, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { Observable, Subscription } from 'rxjs';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.css'],
})
export class ProfileInfoComponent {

  depName!: string;
  depHead!: string;
  optionSelected!: string;
  employee!: { id: string, employeeId: string }
  employeeData$!: Observable<getEmployee | undefined>
  isLoading: boolean = true

  displayedColumns: string[] = ['position', 'name', 'head', 'date', 'action'];
  dataSource: any = new MatTableDataSource()

  constructor(private _profileService: ProfileService,
    public dialog: MatDialog,
    private _employeeService: EmployeeService) { }

  ngOnInit() {
    this.employee = this._employeeService.employeeToken()
    const employeeId = this.employee.employeeId
    this._employeeService.getEmployeeData(employeeId)
    this.employeeData$ = this._employeeService.employeeData$
  }



}

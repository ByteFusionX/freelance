import { Component } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { getEmployeeDetails } from 'src/app/shared/interfaces/employee.interface';
import { EditEmployeeComponent } from '../edit-employee/edit-employee.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';

@Component({
  selector: 'app-view-employee',
  templateUrl: './view-employee.component.html',
  styleUrls: ['./view-employee.component.css']
})
export class ViewEmployeeComponent {
  employeeData!: getEmployeeDetails;

  constructor(
    private _router: Router,
    public dialog: MatDialog,
    public _toast: ToastrService,
    private _employeeService: EmployeeService,
    private route: ActivatedRoute
  ) {
    const navigation = this._router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      this.employeeData = navigation.extras.state as getEmployeeDetails;

    } else {
      const employeeId = this.route.snapshot.paramMap.get('employeeId');
      if (employeeId) {
        let access;
        let userId;
        this._employeeService.employeeData$.subscribe((employee) => {
          access = employee?.category.privileges.employee.viewReport
          userId = employee?._id
        })
        this._employeeService.getEmployeeByEmployeeId(employeeId, access, userId).subscribe((res) => {
          if (res) {
            if (res.access) {
              this.employeeData = res.employeeData;
            } else {
              this._toast.warning('This user detail cannot be displayed to you due to the permissions assigned')
              this._router.navigateByUrl('/home/employees')
            }
          } else {
            this._router.navigateByUrl('/home/employees')
          }
        })
      } else {
        this._router.navigateByUrl('/home/employees')
      }
    }
  }

  onEmployeeEdit() {
    const dialogRef = this.dialog.open(EditEmployeeComponent,
      { data: { employeeData: this.employeeData } });

    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.employeeData = data;
        this._toast.success('Employee Updated Successfully')
      }
    });
  }

}

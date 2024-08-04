import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { getEmployeeDetails } from 'src/app/shared/interfaces/employee.interface';
import { EditEmployeeComponent } from '../edit-employee/edit-employee.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-view-employee',
  templateUrl: './view-employee.component.html',
  styleUrls: ['./view-employee.component.css']
})
export class ViewEmployeeComponent {
  employeeData!: getEmployeeDetails;

  constructor(private _router: Router,
    public dialog: MatDialog,
    public _toast: ToastrService
  ) {
    const navigation = this._router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      this.employeeData = navigation.extras.state as getEmployeeDetails;

    } else {
      this._router.navigateByUrl('/home/employees')
    }
  }

  onEmployeeEdit() {
    const dialogRef = this.dialog.open(EditEmployeeComponent,
      { data: { employeeData: this.employeeData } });

    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        console.log(data,this.employeeData)
        this.employeeData = data;
        this._toast.success('Employee Updated Successfully')
      }
    });
  }

}

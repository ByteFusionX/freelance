import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { getEmployeeDetails } from 'src/app/shared/interfaces/employee.interface';
import { EditEmployeeComponent } from '../edit-employee/edit-employee.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-view-employee',
  templateUrl: './view-employee.component.html',
  styleUrls: ['./view-employee.component.css']
})
export class ViewEmployeeComponent {
  employeeData!: getEmployeeDetails;

  constructor(private _router: Router,
              public dialog: MatDialog,
  ) {
    const navigation = this._router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      this.employeeData = navigation.extras.state as getEmployeeDetails;
      console.log(this.employeeData)
    } else {
      this._router.navigateByUrl('/home/employees')
    }
  }

  onEmployeeEdit() {
    const navigationExtras: NavigationExtras = {
      state: this.employeeData
    };
    console.log(this.employeeData)
    // this._router.navigate(['/home/employees/edit'], navigationExtras);
    const dialogRef = this.dialog.open(EditEmployeeComponent,{data:{employeeData:this.employeeData}});
    // dialogRef.afterClosed().subscribe((data) => {
    //   if (data) {
    //     this.getEmployees()
    //     this._toast.success('Employee Created Successfully')
    //   }
  // });
}

}

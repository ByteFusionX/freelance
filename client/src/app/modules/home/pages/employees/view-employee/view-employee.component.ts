import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { getEmployeeDetails } from 'src/app/shared/interfaces/employee.interface';

@Component({
  selector: 'app-view-employee',
  templateUrl: './view-employee.component.html',
  styleUrls: ['./view-employee.component.css']
})
export class ViewEmployeeComponent {
  employeeData!: getEmployeeDetails;

  constructor(private _router: Router) {
    const navigation = this._router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      this.employeeData = navigation.extras.state as getEmployeeDetails;
      console.log(this.employeeData)
    } else {
      this._router.navigateByUrl('/home/employees')
    }
  }

  onCustomerEdit(){
    const navigationExtras: NavigationExtras = {
      state: this.employeeData
    };
    this._router.navigate(['/customers/edit'], navigationExtras);
  
  }

}

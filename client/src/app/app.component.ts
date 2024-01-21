import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from './core/services/employee/employee.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'client';

  reduceSate: boolean = true
  reduceSideBar(event: boolean) {
    this.reduceSate = event
  }

  constructor(private route:ActivatedRoute,
              private _employeeService:EmployeeService){}

  fetch(){
    this._employeeService.getEmployeeData("NT-1105").subscribe((employeeData) => {
      this._employeeService.setUserDetails(employeeData);
    });
  }

  isLoginRoute():boolean{
    return this.route.snapshot.firstChild?.routeConfig?.path === 'login';
  }
 
}

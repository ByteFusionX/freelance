import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { getEmployee, getEmployeeObject } from '../../interfaces/employee.interface';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  standalone: true,
  providers:[EmployeeService],
  imports: [CommonModule, AppRoutingModule, IconsModule, MatMenuModule, MatButtonModule]
})
export class NavBarComponent {
  @Output() fetchEmployeeName = new EventEmitter<boolean>();
  @Output() reduce = new EventEmitter<boolean>()
  showFullBar: boolean = true
  menuState: boolean = false
  employeeData$!:Observable<getEmployeeObject | null>;



 constructor(private _employeeService: EmployeeService,
             private _router:Router) {
  const employeeId = localStorage.getItem('employeeId') as string;
  
  this._employeeService.getEmployeeData("NT-1105").subscribe((employeeData) => {
    this._employeeService.setUserDetails(employeeData);
  });
  
  this.employeeData$ =  this._employeeService.userDetails$;
  console.log(this.employeeData$)
}
  ngOnInit(){}

  reduceSideBar() {
    this.showFullBar = !this.showFullBar
    this.reduce.emit(this.showFullBar)
  }

  menuOpened() {
    this.menuState = !this.menuState
  }

  menuClosed() {
    this.menuState = !this.menuState
  }

  signOut(){
    localStorage.removeItem('employeeToken')
    this._router.navigate(['/login'])
  }
}

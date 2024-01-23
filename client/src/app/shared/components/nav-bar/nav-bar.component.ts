import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { Observable } from 'rxjs';
import { getEmployee } from '../../interfaces/employee.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  standalone: true,
  imports: [CommonModule, AppRoutingModule, IconsModule, MatMenuModule, MatButtonModule]
})
export class NavBarComponent {

  @Output() reduce = new EventEmitter<boolean>()
  showFullBar: boolean = true
  menuState: boolean = false
  employee!: { id: string, employeeId: string };
  employeeData$!: Observable<getEmployee | undefined>

  constructor(
    private _employeeService: EmployeeService,
    private _router: Router
  ) { }

  ngOnInit() {
    this.employee = this._employeeService.employeeToken()
    if(this.employee){
      const employeeId = this.employee.employeeId
      this._employeeService.getEmployeeData(employeeId)
      this.employeeData$ = this._employeeService.employeeData$
    }
  }

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

  signOut() {
    localStorage.removeItem('employeeToken')
    this._router.navigate(['/login'])
  }
}

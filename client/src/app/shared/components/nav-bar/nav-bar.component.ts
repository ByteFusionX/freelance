import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { getEmployee, getEmployeeObject } from '../../interfaces/employee.interface';

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
  employeeData!:getEmployee

  constructor(private _employeeService:EmployeeService){}


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
}

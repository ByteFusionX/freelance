import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { NavBarComponent } from './pages/nav-bar/nav-bar.component';
import { SideBarComponent } from './pages/side-bar/side-bar.component';

import { AccordionComponent } from 'src/app/shared/components/accordion/accordion.component';

import { IconsModule } from 'src/app/lib/icons/icons.module';
import { EmployeesComponent } from './pages/employees/employees.component';

import { MatTableModule } from '@angular/material/table';
import { CreateEmployeeDialog } from './pages/employees/create-employee/create-employee.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    DashboardComponent,
    NavBarComponent,
    SideBarComponent,
    EmployeesComponent,
    CreateEmployeeDialog
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    IconsModule,
    AccordionComponent,
    MatTableModule,
    MatDialogModule
  ]
})
export class DashboardModule { }

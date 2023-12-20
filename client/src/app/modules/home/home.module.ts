import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateEmployeeDialog } from './pages/employees/create-employee/create-employee.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AnnouncementsComponent } from './pages/announcements/announcements.component';
import { NgApexchartsModule } from "ng-apexcharts";

@NgModule({
  declarations: [
    HomeComponent,
    EmployeesComponent,
    CreateEmployeeDialog,
    DashboardComponent,
    AnnouncementsComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    IconsModule,
    MatTableModule,
    MatDialogModule,
    NgApexchartsModule
  ]
})
export class HomeModule { }

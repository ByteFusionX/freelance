import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AnnouncementsComponent } from './pages/announcements/announcements.component';
import { directiveSharedModule } from 'src/app/shared/directives/directives.module';
import { NgApexchartsModule } from "ng-apexcharts";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SkeltonLoadingComponent } from 'src/app/shared/components/skelton-loading/skelton-loading.component';
import { ConfettiComponentComponent } from 'src/app/shared/components/confetti-component/confetti-component.component';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { CreateCategoryComponent } from './pages/employees/create-category/create-category.component';
import { ViewEmployeeComponent } from './pages/employees/view-employee/view-employee.component';
import { EditEmployeeComponent } from './pages/employees/edit-employee/edit-employee.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { GaugeChartComponent } from 'src/app/shared/components/charts/gauge-chart/gauge-chart.component';
import { DoughnutChartComponent } from 'src/app/shared/components/charts/doughnut-chart/doughnut-chart.component';
import { HalfDoughnutChartComponent } from 'src/app/shared/components/charts/half-doughnut-chart/half-doughnut-chart.component';
import { LineChartComponent } from 'src/app/shared/components/charts/line-chart/line-chart.component';

@NgModule({
  declarations: [
    HomeComponent,
    EmployeesComponent,
    DashboardComponent,
    AnnouncementsComponent,
    CreateCategoryComponent,
    ViewEmployeeComponent,
    EditEmployeeComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    IconsModule,
    MatTableModule,
    MatDialogModule,
    NgApexchartsModule,
    directiveSharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    SkeltonLoadingComponent,
    ConfettiComponentComponent,
    PaginationComponent,
    MatSidenavModule,
    GaugeChartComponent,
    DoughnutChartComponent,
    HalfDoughnutChartComponent,
    LineChartComponent,
  ]
})
export class HomeModule { }

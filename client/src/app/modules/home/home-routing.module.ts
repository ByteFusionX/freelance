import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeesComponent } from './pages/employees/employees.component';
import { HomeComponent } from './home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AnnouncementsComponent } from './pages/announcements/announcements.component';
import { RoleGuard } from 'src/app/core/guards/role/role.guard';
import { ViewEmployeeComponent } from './pages/employees/view-employee/view-employee.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'employees', canActivate:[RoleGuard], component: EmployeesComponent },
      { path: 'employees/view', canActivate: [RoleGuard], component: ViewEmployeeComponent },
      { path: 'announcements', canActivate:[RoleGuard], component: AnnouncementsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }

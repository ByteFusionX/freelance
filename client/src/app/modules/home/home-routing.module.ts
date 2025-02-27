import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeesComponent } from './pages/employees/employees.component';
import { HomeComponent } from './home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AnnouncementsComponent } from './pages/announcements/announcements.component';
import { RoleGuard } from 'src/app/core/guards/role/role.guard';
import { ViewEmployeeComponent } from './pages/employees/view-employee/view-employee.component';
import { EditEmployeeComponent } from './pages/employees/edit-employee/edit-employee.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'employees', canActivate:[RoleGuard], component: EmployeesComponent },
      { path: 'employees/view/:employeeId', canActivate: [RoleGuard], component: ViewEmployeeComponent },
      { path: 'announcements', canActivate:[RoleGuard], component: AnnouncementsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeesComponent } from './pages/employees/employees.component';
import { HomeComponent } from './home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AnnouncementsComponent } from './pages/announcements/announcements.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'employees', component: EmployeesComponent },
      { path: 'announcements', component: AnnouncementsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileInfoComponent } from './pages/profile-info/profile-info.component';
import { employeeLoginGuard } from '../guards/employee-login.guard';

const routes: Routes = [
  { path: '',canActivate:[employeeLoginGuard], component: ProfileInfoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }

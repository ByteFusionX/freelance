import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortalManagementComponent } from './pages/portal-management/portal-management.component';
import { RoleGuard } from 'src/app/core/guards/role/role.guard';

const routes: Routes = [
  { path: '',canActivate:[RoleGuard], component: PortalManagementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }

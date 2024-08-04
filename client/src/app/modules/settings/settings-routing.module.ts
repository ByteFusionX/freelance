import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortalManagementComponent } from './pages/portal-management/portal-management.component';

const routes: Routes = [
  { path: '', component: PortalManagementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }

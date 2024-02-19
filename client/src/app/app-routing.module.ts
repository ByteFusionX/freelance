import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth/auth.guard';

const routes: Routes = [
  { path: '', canActivate: [AuthGuard], loadChildren: () => import('./modules/home/home.module').then((m) => m.HomeModule) },
  { path: 'customers', canActivate: [AuthGuard], loadChildren: () => import('./modules/customers/customers.module').then((m) => m.CustomersModule) },
  { path: 'enquiry', canActivate: [AuthGuard], loadChildren: () => import('./modules/enquirys/enquiry.module').then((m) => m.EnquiryModule) },
  { path: 'assigned-jobs', canActivate: [AuthGuard], loadChildren: () => import('./modules/assigned-jobs/assigned-jobs.module').then((m) => m.AssignedJobsModule) },
  { path: 'quotations', canActivate: [AuthGuard], loadChildren: () => import('./modules/quotations/quotations.module').then((m) => m.QuotationsModule) },
  { path: 'job-sheet', canActivate: [AuthGuard], loadChildren: () => import('./modules/job-sheet/job-sheet.module').then((m) => m.JobSheetModule) },
  { path: 'profile', canActivate: [AuthGuard], loadChildren: () => import('./modules/profile/profile.module').then((m) => m.ProfileModule) },
  { path: 'login', canActivate: [AuthGuard], loadChildren: () => import('./modules/login/login.module').then((m) => m.LoginModule) },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
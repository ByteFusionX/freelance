import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', canActivate: [AuthGuard], loadChildren: () => import('./modules/home/home.module').then((m) => m.HomeModule) },
  { path: 'customers', loadChildren: () => import('./modules/customers/customers.module').then((m) => m.CustomersModule) },
  { path: 'enquiry', loadChildren: () => import('./modules/enquirys/enquiry.module').then((m) => m.EnquiryModule) },
  { path: 'assigned-jobs', loadChildren: () => import('./modules/assigned-jobs/assigned-jobs.module').then((m) => m.AssignedJobsModule) },
  { path: 'quotations', loadChildren: () => import('./modules/quotations/quotations.module').then((m) => m.QuotationsModule) },
  { path: 'job-sheet', loadChildren: () => import('./modules/job-sheet/job-sheet.module').then((m) => m.JobSheetModule) },
  { path: 'profile', loadChildren: () => import('./modules/profile/profile.module').then((m) => m.ProfileModule) },
  { path: 'login', loadChildren: () => import('./modules/login/login.module').then((m) => m.LoginModule) },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
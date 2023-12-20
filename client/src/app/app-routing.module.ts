import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./modules/home/home.module').then((m) => m.HomeModule) },
  { path: 'customers', loadChildren: () => import('./modules/customers/customers.module').then((m) => m.CustomersModule) },
  { path: 'enquiry', loadChildren: () => import('./modules/enquirys/enquiry.module').then((m) => m.EnquiryModule) },
  { path: 'quotations', loadChildren: () => import('./modules/quotations/quotations.module').then((m) => m.QuotationsModule) },
  { path: 'jobs', loadChildren: () => import('./modules/jobs/jobs.module').then((m) => m.JobsModule) },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

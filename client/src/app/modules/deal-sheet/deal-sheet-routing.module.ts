import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DealSheetComponent } from './deal-sheet.component';
import { RoleGuard } from 'src/app/core/guards/role/role.guard';
import { PendingDealsComponent } from './pending-deals/pending-deals.component';
import { ApprovedDealsComponent } from './approved-deals/approved-deals.component';

const routes: Routes = [
  {
    path: '', canActivate: [RoleGuard], component: DealSheetComponent,
    children: [
      { path: '', redirectTo: 'pendings', pathMatch: 'full' },
      { path: 'pendings', canActivate: [RoleGuard], component: PendingDealsComponent },
      { path: 'approved', canActivate: [RoleGuard], component: ApprovedDealsComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DealSheetRoutingModule { }

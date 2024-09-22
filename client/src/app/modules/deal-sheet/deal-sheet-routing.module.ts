import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DealSheetComponent } from './deal-sheet.component';
import { RoleGuard } from 'src/app/core/guards/role/role.guard';

const routes: Routes = [
  {
    path: '',canActivate:[RoleGuard], component: DealSheetComponent,
    children: [
      { path: '',canActivate:[RoleGuard], component: DealSheetComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DealSheetRoutingModule { }

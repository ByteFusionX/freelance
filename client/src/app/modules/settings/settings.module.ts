import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgIconsModule } from '@ng-icons/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { directiveSharedModule } from 'src/app/shared/directives/directives.module';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { MatTableModule } from '@angular/material/table';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatDialogModule } from '@angular/material/dialog';
import { SkeltonLoadingComponent } from 'src/app/shared/components/skelton-loading/skelton-loading.component';
import { CreateDepartmentDialog } from './pages/create-department/create-department.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { PortalManagementComponent } from './pages/portal-management/portal-management.component';
import { EditCategoryComponent } from './pages/edit-category/edit-category.component';
import { pipeModule } from "../../shared/pipes/pipe.module";



@NgModule({
  declarations: [
    CreateDepartmentDialog,
    PortalManagementComponent,
    EditCategoryComponent,
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    NgIconsModule,
    FormsModule,
    ReactiveFormsModule,
    directiveSharedModule,
    MatTableModule,
    MatDialogModule,
    NgSelectModule,
    SkeltonLoadingComponent,
    pipeModule
],
  providers: [ProfileService, EmployeeService]
})
export class SettingsModule { }

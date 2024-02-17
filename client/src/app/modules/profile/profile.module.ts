import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileInfoComponent } from './pages/profile-info/profile-info.component';
import { NgIconsModule } from '@ng-icons/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { directiveSharedModule } from 'src/app/shared/directives/directives.module';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { MatTableModule } from '@angular/material/table';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CreateDepartmentDialog } from './pages/create-department/create-department.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SkeltonLoadingComponent } from 'src/app/shared/components/skelton-loading/skelton-loading.component';



@NgModule({
  declarations: [
    ProfileInfoComponent,
    CreateDepartmentDialog,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    NgIconsModule,
    FormsModule,
    ReactiveFormsModule,
    directiveSharedModule,
    MatTableModule,
    MatDialogModule,
    NgSelectModule,
    SkeltonLoadingComponent,
  ],
  providers: [ProfileService, EmployeeService]
})
export class ProfileModule { }

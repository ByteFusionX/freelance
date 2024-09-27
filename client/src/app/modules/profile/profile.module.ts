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
import { MatDialogModule } from '@angular/material/dialog';
import { SkeltonLoadingComponent } from 'src/app/shared/components/skelton-loading/skelton-loading.component';
import { EditCompanyDetailsComponent } from './pages/edit-company-details/edit-company-details.component';
import { pipeModule } from "../../shared/pipes/pipe.module";



@NgModule({
  declarations: [
    ProfileInfoComponent,
    EditCompanyDetailsComponent,
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
    pipeModule
],
  providers: [ProfileService, EmployeeService]
})
export class ProfileModule { }

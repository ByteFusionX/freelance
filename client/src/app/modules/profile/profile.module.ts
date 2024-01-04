import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileInfoComponent } from './pages/profile-info/profile-info.component';
import { NgIconsModule } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from 'src/app/shared/components/custom-select/custom-select.component';
import { HttpClientModule } from '@angular/common/http';
import { directiveSharedModule } from 'src/app/shared/directives/directives.module';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { MatTableModule } from '@angular/material/table';



@NgModule({
  declarations: [
    ProfileInfoComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    NgIconsModule,
    FormsModule,
    CustomSelectComponent,
    HttpClientModule,
    directiveSharedModule,
    MatTableModule,
  ],
  providers: [ProfileService]

})
export class ProfileModule { }

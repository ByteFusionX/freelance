import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileInfoComponent } from './pages/profile-info/profile-info.component';
import { NgIconsModule } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from 'src/app/shared/components/custom-select/custom-select.component';
import { MatTableModule } from '@angular/material/table';
import { ProfileService } from 'src/app/core/services/profile/profile.service';

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
    MatTableModule,
  ],
  providers: [ProfileService]
})
export class ProfileModule { }

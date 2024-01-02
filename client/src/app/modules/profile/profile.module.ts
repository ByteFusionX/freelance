import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileInfoComponent } from './pages/profile-info/profile-info.component';
import { NgIconsModule } from '@ng-icons/core';
import { FormsModule} from '@angular/forms';
import { CustomSelectComponent } from 'src/app/shared/components/custom-select/custom-select.component';
import { directiveSharedModule } from 'src/app/shared/directives/directives.module';

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
    directiveSharedModule
  ]
})
export class ProfileModule { }

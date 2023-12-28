import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileInfoComponent } from './pages/profile-info/profile-info.component';
import { NgIconsModule } from '@ng-icons/core';
import { FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    ProfileInfoComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    NgIconsModule,
    FormsModule
  ]
})
export class ProfileModule { }

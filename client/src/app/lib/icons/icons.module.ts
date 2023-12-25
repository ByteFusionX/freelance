import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgIconsModule } from '@ng-icons/core';
import { 
  heroBars3, 
  heroMagnifyingGlass, 
  heroUserCircle, 
  heroChevronDown, 
  heroHome, 
  heroChevronUp, 
  heroUserGroup, 
  heroChevronRight, 
  heroQuestionMarkCircle, 
  heroBriefcase,
  heroNewspaper, 
  heroBars3CenterLeft,
  heroXMark,
  heroUser,
  heroArrowRightOnRectangle,
  heroPaperClip
} from '@ng-icons/heroicons/outline';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgIconsModule,
    NgIconsModule.withIcons({ 
      heroBars3, 
      heroMagnifyingGlass, 
      heroUserCircle, 
      heroChevronDown, 
      heroHome, 
      heroChevronUp, 
      heroUserGroup, 
      heroChevronRight, 
      heroQuestionMarkCircle, 
      heroBriefcase, 
      heroNewspaper,
      heroBars3CenterLeft,
      heroXMark,
      heroUser,
      heroArrowRightOnRectangle,
      heroPaperClip
    })
  ],
  exports:[NgIconsModule]
})

export class IconsModule { }

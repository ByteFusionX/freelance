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
  heroPaperClip,
  heroAdjustmentsHorizontal,
  heroArrowUp,
  heroClipboardDocumentList,
  heroShieldCheck,
  heroCube,
  heroArrowDown,
  heroCalendarDays,
  heroBellAlert,
  heroIdentification,
  heroBuildingOffice,
  heroMapPin,
  heroBuildingLibrary,
  heroPencilSquare,
  heroInboxArrowDown,
  heroDocumentArrowUp,
  heroEye,
  heroEyeSlash,
  heroCloudArrowUp,
  heroRectangleStack
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
      heroPaperClip,
      heroAdjustmentsHorizontal,
      heroArrowUp,
      heroArrowDown,
      heroClipboardDocumentList,
      heroShieldCheck,
      heroCube,
      heroCalendarDays,
      heroBellAlert,
      heroIdentification,
      heroBuildingOffice,
      heroMapPin,
      heroBuildingLibrary,
      heroPencilSquare,
      heroInboxArrowDown,
      heroDocumentArrowUp,
      heroEye,
      heroEyeSlash,
      heroCloudArrowUp
    }),
  ],
  exports:[NgIconsModule]
})

export class IconsModule { }

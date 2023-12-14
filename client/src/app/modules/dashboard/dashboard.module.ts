import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { NavBarComponent } from './pages/nav-bar/nav-bar.component';
import { SideBarComponent } from './pages/side-bar/side-bar.component';

import { NgIconsModule } from '@ng-icons/core';
import { heroBars3, heroMagnifyingGlass, heroUserCircle, heroChevronDown, heroHome, heroChevronUp, heroUserGroup, heroChevronRight, heroQuestionMarkCircle, heroBriefcase, heroNewspaper } from '@ng-icons/heroicons/outline';
import { AccordionComponent } from 'src/app/shared/components/accordion/accordion.component';

@NgModule({
  declarations: [
    DashboardComponent,
    NavBarComponent,
    SideBarComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    NgIconsModule.withIcons({ heroBars3, heroMagnifyingGlass, heroUserCircle, heroChevronDown, heroHome, heroChevronUp, heroUserGroup, heroChevronRight, heroQuestionMarkCircle, heroBriefcase, heroNewspaper }),
    AccordionComponent
  ]
})
export class DashboardModule { }

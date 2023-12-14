import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { NavBarComponent } from './pages/nav-bar/nav-bar.component';
import { SideBarComponent } from './pages/side-bar/side-bar.component';

import { AccordionComponent } from 'src/app/shared/components/accordion/accordion.component';
import { IconsModule } from 'src/app/lib/icons/icons.module';

@NgModule({
  declarations: [
    DashboardComponent,
    NavBarComponent,
    SideBarComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    AccordionComponent,
    IconsModule
  ]
})
export class DashboardModule { }

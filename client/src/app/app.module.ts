import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavBarComponent } from './shared/components/nav-bar/nav-bar.component';
import { SideBarComponent } from './shared/components/side-bar/side-bar.component';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { IconsModule } from './lib/icons/icons.module';
import { componentModule } from './shared/components/component.module';


@NgModule({
  declarations: [
    AppComponent
        
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NavBarComponent,
    SideBarComponent,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    HttpClientModule,
    IconsModule,
    MatDialogModule,
    componentModule
    
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

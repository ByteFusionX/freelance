import { Component, ElementRef, HostListener, Input, OnChanges } from '@angular/core';
import { buttonSlideState, dropDownMenuSate, sideBarState } from './side-bar.animation';
import { NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from 'src/app/app-routing.module';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
  animations: [sideBarState, dropDownMenuSate, buttonSlideState],
  standalone: true,
  imports: [CommonModule, IconsModule, AppRoutingModule]
})
export class SideBarComponent implements OnChanges {

  @Input() showFullBar: boolean = true

  homeDropDown: boolean = false
  jobDropDown: boolean = false

  constructor(private eref: ElementRef, private router: Router) { }

  ngOnChanges(): void {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart &&
        event.url.includes('home')) {
        this.homeDropDown = true
      }

      if (event instanceof NavigationStart &&
        event.url.includes('job')) {
        this.jobDropDown = true
      }

      if(event instanceof NavigationEnd){}

      if(event instanceof NavigationError){}

    });
  }

  @HostListener('document:click', ['$event.target'])
  onClick(event: HTMLElement) {
    if (!(this.eref.nativeElement.contains(event))) {
      this.homeDropDown = this.jobDropDown = false;
    }
  }

  onHomeClick() {
    this.homeDropDown = !this.homeDropDown
    this.jobDropDown = false
  }

  onJobClick() {
    this.jobDropDown = !this.jobDropDown
    this.homeDropDown = false
  }
}

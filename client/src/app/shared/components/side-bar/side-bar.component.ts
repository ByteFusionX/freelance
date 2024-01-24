import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges } from '@angular/core';
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
export class SideBarComponent implements AfterViewInit {

  @Input() showFullBar: boolean = true
  homeDropDown: boolean = false

  constructor(private eref: ElementRef, private router: Router) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.showFullBar = window.innerWidth >= 767
    this.homeDropDown = false
  }

  ngAfterViewInit(): void {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart &&
        event.url.includes('home')) {
        this.homeDropDown = true
      }
      if (event instanceof NavigationEnd) { }
      if (event instanceof NavigationError) { }
    });
  }

  @HostListener('document:click', ['$event.target'])
  onClick(event: HTMLElement) {
    if (!(this.eref.nativeElement.contains(event)) && !this.showFullBar) {
      this.homeDropDown = false;
    }
  }

  onHomeClick() {
    this.homeDropDown = !this.homeDropDown
  }
}

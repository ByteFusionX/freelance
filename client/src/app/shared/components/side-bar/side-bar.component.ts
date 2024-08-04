import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnDestroy } from '@angular/core';
import { buttonSlideState, dropDownMenuSate, sideBarState } from './side-bar.animation';
import { NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { IconsModule } from 'src/app/lib/icons/icons.module';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { Privileges } from '../../interfaces/employee.interface';
import { AnnouncementService } from 'src/app/core/services/announcement/announcement.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
  animations: [sideBarState, dropDownMenuSate, buttonSlideState],
  standalone: true,
  imports: [CommonModule, IconsModule, AppRoutingModule, MatTooltipModule]
})
export class SideBarComponent implements AfterViewInit, OnDestroy {

  @Input() showFullBar: boolean = true
  homeDropDown: boolean = false;

  showTabs: boolean = false;
  privileges!: Privileges | undefined;
  notifyCount!: number
  notViewedPresaleCount!: number
  mySubscription: Subscription = new Subscription()
  userId!: any

  constructor(
    private eref: ElementRef,
    private router: Router,
    private _employeeService: EmployeeService,
    private _announcementService: AnnouncementService
  ) { }

  ngOnInit() {
    this.checkPermission()
    this._employeeService.employeeData$.subscribe((res) => {
      if(res){
        this.userId = res
        this._announcementService.onCheckNotViewed(this.userId._id)
      }
    })
    this.mySubscription = this._announcementService.getNewAnnouncements().subscribe((res) => {
      this.notifyCount = res.notViewedCount
      this.notViewedPresaleCount = res.notViewedPresaleCount
    })
    setTimeout(() => {
      this.showTabs = true;
    }, 1000);
  }

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

  checkPermission() {
    this._employeeService.employeeData$.subscribe((data) => {
      this.privileges = data?.category.privileges
    })
  }

  onHomeClick() {
    this.homeDropDown = !this.homeDropDown
  }

  ngOnDestroy(): void {
    if (this.mySubscription) {
      this.mySubscription.unsubscribe()
    }
  }
}

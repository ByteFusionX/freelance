import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAnnouncementComponent } from './add-announcement/add-announcement.component';
import { AnnouncementService } from 'src/app/core/services/announcement/announcement.service';
import { Subscription } from 'rxjs';
import { announcementGetData } from 'src/app/shared/interfaces/announcement.interface';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';



@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent implements OnDestroy, OnInit {
  isLoading: boolean = true;
  isEmpty: boolean = false;
  createAnnouncement:boolean | undefined = false;

  mySubscription!: Subscription
  announcementData: announcementGetData[] = []
  recentData!: announcementGetData

  constructor(
    public dialog: MatDialog,
    private _service: AnnouncementService,
    private toaster: ToastrService,
    private _employeeService: EmployeeService,
  ) { }
  
  ngOnInit(): void {
    this.checkPermission()
    this.getAnnouncementData()
  }

  openDialog() {
    const dialogRef = this.dialog.open(AddAnnouncementComponent);

    this.mySubscription = dialogRef.afterClosed().subscribe(result => {
      this.getAnnouncementData()
      this.toaster.success('Announcement added!', 'Success')
    });
  }

  getAnnouncementData() {
    this.mySubscription = this._service.getAnnouncment().subscribe((res) => {
      if (res)
        this.isLoading = false
      this.announcementData = res
      this.recentData = this.announcementData.shift() as announcementGetData
    }, (error) => {
      this.isEmpty = true
    }
    )
  }

  trackByIdFn(index: number, item: announcementGetData): string {
    return item._id;
  }

  checkPermission() {
    this._employeeService.employeeData$.subscribe((data) => {
      this.createAnnouncement = data?.category.privileges.announcement.create
    })
  }

  ngOnDestroy(): void {
    this.mySubscription.unsubscribe()
  }

}

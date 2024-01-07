import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAnnouncementComponent } from './add-announcement/add-announcement.component';
import { AnnouncementService } from 'src/app/core/services/announcement/announcement.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent implements OnDestroy, OnInit {
  mySubscription!: Subscription
  announcementData: any = []
  recentData: any;
  isLoading: boolean = true;

  constructor(
    public dialog: MatDialog,
    private _service: AnnouncementService
  ) { }

  ngOnInit(): void {
    this.getAnnouncementData()
  }

  openDialog() {
    const dialogRef = this.dialog.open(AddAnnouncementComponent);

    this.mySubscription = dialogRef.afterClosed().subscribe(result => {
      this.getAnnouncementData()
    });
  }

  getAnnouncementData() {
    this.mySubscription = this._service.getAnnouncment().subscribe((res) => {
      if (res)
        this.announcementData = res
        this.recentData = this.announcementData.shift()
        this.isLoading = false
    })
  }

  trackByIdFn(index: number, item: any): number {
    return item._id;
  }


  ngOnDestroy(): void {
    this.mySubscription.unsubscribe()
  }

}

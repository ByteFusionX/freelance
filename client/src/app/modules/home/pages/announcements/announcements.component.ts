import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAnnouncementComponent } from './add-announcement/add-announcement.component';


@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent {
  constructor(public dialog: MatDialog) { }

  openDialog() {
    const dialogRef = this.dialog.open(AddAnnouncementComponent);

    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
    });
  }

  announcementData: any = [
    { title: 'Onam Holidays', description: 'In this example, the removeTimeFromDate function sets the hours, minutes, seconds, and milliseconds to zero, effectively removing the time component from the date. Then, you can use the getTime() method to get the timestamp for each date and compare them. If the timestamps are equal, the dates are considered equal', date: '12-12-2023', postedDate: new Date() },
    { title: 'Christmas Holidays', description: 'In this example, the removeTimeFromDate function sets the hours, minutes, seconds, and milliseconds to zero, effectively removing the time component from the date. Then, you can use the getTime() method to get the timestamp for each date and compare them. If the timestamps are equal, the dates are considered equal', date: '12-12-2023', postedDate: new Date() },
    { title: 'Holi Holidays', description: 'In this example, the removeTimeFromDate function sets the hours, minutes, seconds, and milliseconds to zero, effectively removing the time component from the date. Then, you can use the getTime() method to get the timestamp for each date and compare them. If the timestamps are equal, the dates are considered equal', date: '12-12-2023', postedDate: new Date() },
  ]
  recentData = this.announcementData.shift()


}

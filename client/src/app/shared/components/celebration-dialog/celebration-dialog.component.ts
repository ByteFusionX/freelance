import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { announcementGetData } from '../../interfaces/announcement.interface';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-celebration-dialog',
  templateUrl: './celebration-dialog.component.html',
  styleUrls: ['./celebration-dialog.component.css']
})
export class CelebrationDialogComponent implements OnInit {
  celebData!: announcementGetData;
  countdown: number = 5; // Initial countdown value
  private countdownSubscription: Subscription | undefined;

  constructor(@Inject(MAT_DIALOG_DATA) public data: announcementGetData, private dialogRef: MatDialogRef<CelebrationDialogComponent>) {
    this.celebData = this.data;
  }

  ngOnInit(): void {
    this.startCountdown();
  }

  startCountdown() {
    this.countdownSubscription = interval(1000).subscribe(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        // When the countdown reaches 0, close the dialog
        this.dialogRef.close();
        if (this.countdownSubscription) {
          this.countdownSubscription.unsubscribe();
        }
      }
    });
  }

  onClose() {
    // Stop the countdown when the dialog is closed
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    this.dialogRef.close();
  }
}

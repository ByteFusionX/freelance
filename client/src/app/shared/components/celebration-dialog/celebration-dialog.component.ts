import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { announcementGetData } from '../../interfaces/announcement.interface';

@Component({
  selector: 'app-celebration-dialog',
  templateUrl: './celebration-dialog.component.html',
  styleUrls: ['./celebration-dialog.component.css']
})
export class CelebrationDialogComponent implements OnInit {
  celebData: announcementGetData[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: announcementGetData[],private dialogRef: MatDialogRef<CelebrationDialogComponent>) {
    this.celebData = this.data;
  }

  ngOnInit(): void {

  }
  onClose() {
    this.dialogRef.close();
  }
}

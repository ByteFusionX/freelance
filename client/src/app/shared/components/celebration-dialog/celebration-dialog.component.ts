import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { announcementGetData } from '../../interfaces/announcement.interface';

@Component({
  selector: 'app-celebration-dialog',
  templateUrl: './celebration-dialog.component.html',
  styleUrls: ['./celebration-dialog.component.css']
})
export class CelebrationDialogComponent implements OnInit {
  celebData: announcementGetData[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: announcementGetData[],private dialogRef: MatDialogRef<CelebrationDialogComponent>,private cd: ChangeDetectorRef) {
  
    
  }
  

  ngOnInit(): void {
    this.celebData = this.data;
    this.cd.detectChanges();
  }
  onClose() {
    this.dialogRef.close();
  }
}

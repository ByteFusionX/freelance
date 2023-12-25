import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-enquiry',
  templateUrl: './create-enquiry.component.html',
  styleUrls: ['./create-enquiry.component.css']
})
export class CreateEnquiryDialog {
  constructor(
    public dialogRef:MatDialogRef<CreateEnquiryDialog>
  ){}

  onClose(){
    this.dialogRef.close()
  }
}

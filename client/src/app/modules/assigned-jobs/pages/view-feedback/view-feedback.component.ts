import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { feedback } from 'src/app/shared/interfaces/enquiry.interface';

@Component({
  selector: 'app-view-feedback',
  templateUrl: './view-feedback.component.html',
  styleUrls: ['./view-feedback.component.css']
})
export class ViewFeedbackComponent {

  constructor(
    private dialogRef: MatDialogRef<ViewFeedbackComponent>,
    @Inject(MAT_DIALOG_DATA) public data: feedback,
  ) { }

  closeModal() {
    this.dialogRef.close()
  }
}

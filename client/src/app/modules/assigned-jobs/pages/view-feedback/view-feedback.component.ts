import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { feedback } from 'src/app/shared/interfaces/enquiry.interface';

@Component({
  selector: 'app-view-feedback',
  templateUrl: './view-feedback.component.html',
  styleUrls: ['./view-feedback.component.css']
})
export class ViewFeedbackComponent {

  constructor(
    private dialogRef: MatDialogRef<ViewFeedbackComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { feedback: feedback[], enqId: string },
    private _enquiryService: EnquiryService,
    private _notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.data.feedback.forEach((feedback) => {
      if (!feedback.seenByFeedbackRequester && feedback.feedback) {
        this._enquiryService.markFeedbackResponseAsViewed(this.data.enqId, feedback._id).subscribe((res) => {
          if (res) {
            this._notificationService.decrementNotificationCount('assignedJob', 1)
          }
        })
      }
    })
  }

  closeModal() {
    this.dialogRef.close()
  }
}

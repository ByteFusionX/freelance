import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { dealData, priceDetails, Quotatation, QuoteItem } from 'src/app/shared/interfaces/quotation.interface';
import { UpdatedealsheetComponent } from '../updatedealsheet-component/updatedealsheet-component.component';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { ViewCommentComponent } from '../../assigned-jobs/pages/view-comment/view-comment.component';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { HttpEventType } from '@angular/common/http';
import saveAs from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-approve-deal',
  templateUrl: './approve-deal.component.html',
  styleUrls: ['./approve-deal.component.css']
})
export class ApproveDealComponent implements OnInit {
  isApproving: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ApproveDealComponent>,
    private _dialog: MatDialog,
    private _quoteService: QuotationService,
    private _employeeService: EmployeeService,
    private _enquiryService: EnquiryService,
    private toast: ToastrService,
    private _notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: { approval: boolean, quoteData: Quotatation, quoteItems: (QuoteItem | undefined)[], priceDetails: priceDetails, quoteView: boolean }
  ) {
  }

  userId!: string

  ngOnInit(): void {
    console.log(this.data.quoteData.dealData)
    this._employeeService.employeeData$.subscribe((data) => {
      if (data?._id) {
        this.userId = data?._id;
      }
    })
    if (this.data.quoteData.dealData.seenedBySalsePerson === false) {
      this._quoteService.markAsQuotationSeen(this.data.quoteData._id, this.userId).subscribe((res: any) => {
        if (res.success) {
          this._notificationService.decrementNotificationCount('quotation', 1)
        }
      })
    }
  }



  onClose() {
    this.dialogRef.close()
  }

  onUpdate() {
    this.dialogRef.close({ approve: false, updating: true })
    const updateModal = this._dialog.open(UpdatedealsheetComponent, {
      data: this.data
    })

    updateModal.afterClosed().subscribe((dealData: dealData) => {
      console.log("working ")
      if (dealData) {
        this._quoteService.saveDealSheet(dealData, this.data.quoteData._id).subscribe((res) => {
          console.log('Updated')
        })
      }
    })
  }

  onDownloadClicks(file: any) {
    this._enquiryService.downloadFile(file.fileName)
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.DownloadProgress) {
          } else if (event.type === HttpEventType.Response) {
            const fileContent: Blob = new Blob([event['body']])
            saveAs(fileContent, file.originalname)
          }
        },
        error: (error) => {
          if (error.status == 404) {
            this.toast.warning('Sorry, The requested file was not found on the server. Please ensure that the file exists and try again.')
          }
        }
      })
  }

  openReview() {
    this._dialog.open(ViewCommentComponent, {
      data: { comment: this.data.quoteData.dealData.comments[0] },
      width: '500px'
    });
  }



  onApprove() {
    const dialogRef = this._dialog.open(ConfirmationDialogComponent,
      {
        data: {
          title: `Are you absolutely sure?`,
          description: `This action cannot be undone. This will approve this deal and proceed to job.`,
          icon: 'heroExclamationCircle',
          IconColor: 'orange'
        }
      });

    dialogRef.afterClosed().subscribe((approved: boolean) => {
      if (approved) {
        this.isApproving = true;
        this.dialogRef.close({ approve: true, updating: false })
      }
    })
  }

}

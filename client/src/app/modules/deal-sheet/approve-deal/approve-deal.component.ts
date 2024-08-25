import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { dealData, priceDetails, Quotatation, QuoteItem } from 'src/app/shared/interfaces/quotation.interface';
import { UpdatedealsheetComponent } from '../updatedealsheet-component/updatedealsheet-component.component';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { ViewCommentComponent } from '../../assigned-jobs/pages/view-comment/view-comment.component';

@Component({
  selector: 'app-approve-deal',
  templateUrl: './approve-deal.component.html',
  styleUrls: ['./approve-deal.component.css']
})
export class ApproveDealComponent {
  isApproving: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ApproveDealComponent>,
    private _dialog: MatDialog,
    private _quoteService: QuotationService,
    @Inject(MAT_DIALOG_DATA) public data: { approval: boolean, quoteData: Quotatation, quoteItems: (QuoteItem | undefined)[], priceDetails: priceDetails, quoteView: boolean }
  ) {
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

  openReview() {
    this._dialog.open(ViewCommentComponent, {
      data: { comment: this.data.quoteData.dealData.comments[0] }
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

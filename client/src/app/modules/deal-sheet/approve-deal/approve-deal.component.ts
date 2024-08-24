import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { priceDetails, Quotatation, QuoteItem } from 'src/app/shared/interfaces/quotation.interface';

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
    @Inject(MAT_DIALOG_DATA) public data: { approval: boolean, quoteData: Quotatation, quoteItems: (QuoteItem | undefined)[], priceDetails: priceDetails, quoteView: boolean }
  ) {
  }

  onClose() {
    this.dialogRef.close()
  }

  onUpdate() {

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
        this.dialogRef.close(true)
      }
    })
  }

}

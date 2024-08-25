import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NavigationExtras, Router } from '@angular/router';
import { QuoteItem } from 'src/app/shared/interfaces/quotation.interface';

@Component({
  selector: 'app-view-estimation',
  templateUrl: './view-estimation.component.html',
  styleUrls: ['./view-estimation.component.css']
})
export class ViewEstimationComponent {
  constructor(
    private dialogRef: MatDialogRef<ViewEstimationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { items: QuoteItem[], enqId: string, isEdit: boolean },
    private _router: Router
  ) { }

  onEstimationEdit() {
    this.dialogRef.close()
    const navigationExtras: NavigationExtras = {
      state: { items: this.data.items, enquiryId: this.data.enqId }
    };
    this._router.navigate(['/assigned-jobs/edit-estimations'], navigationExtras);
  }

  onClose() {
    this.dialogRef.close()
  }
}

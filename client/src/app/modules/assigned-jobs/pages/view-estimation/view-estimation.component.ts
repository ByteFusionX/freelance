import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NavigationExtras, Router } from '@angular/router';
import { Estimations } from 'src/app/shared/interfaces/enquiry.interface';
import { QuoteItem } from 'src/app/shared/interfaces/quotation.interface';

@Component({
  selector: 'app-view-estimation',
  templateUrl: './view-estimation.component.html',
  styleUrls: ['./view-estimation.component.css']
})
export class ViewEstimationComponent {
  constructor(
    private dialogRef: MatDialogRef<ViewEstimationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { estimation: Estimations, enqId: string, isEdit: boolean },
    private _router: Router
  ) { }

  onEstimationEdit() {
    this.dialogRef.close()
    const navigationExtras: NavigationExtras = {
      state: { estimation: this.data.estimation, enquiryId: this.data.enqId }
    };
    this._router.navigate(['/assigned-jobs/edit-estimations'], navigationExtras);
  }

  calculateTotalCost(i: number, j: number) {
    return this.data.estimation.items[i].itemDetails[j].quantity * this.data.estimation.items[i].itemDetails[j].unitCost;
  }

  calculateAllTotalCost() {
    let totalCost = 0;
    this.data.estimation.items.forEach((item, i) => {
      item.itemDetails.forEach((itemDetail, j) => {
        totalCost += this.calculateTotalCost(i, j)
      })
    })
    return totalCost;
  }

  calculateSellingPrice(): number {
    let totalCost = 0;
    this.data.estimation.items.forEach((item, i) => {
      item.itemDetails.forEach((itemDetail, j) => {
        totalCost += this.calculateTotalPrice(i, j)
      })
    })
    return totalCost;
  }

  calculateUnitPrice(i: number, j: number) {
    const decimalMargin = this.data.estimation.items[i].itemDetails[j].profit / 100;
    return this.data.estimation.items[i].itemDetails[j].unitCost / (1 - decimalMargin)
  }

  calculateTotalPrice(i: number, j: number) {
    return this.calculateUnitPrice(i, j) * this.data.estimation.items[i].itemDetails[j].quantity;
  }

  calculateProfitMargin(): number {
    return this.calculateSellingPrice() - this.calculateAllTotalCost() || 0
  }

  calculateTotalProfit(): number {
    return ((this.calculateSellingPrice() - this.calculateAllTotalCost()) / this.calculateSellingPrice() * 100) || 0
  }

  calculateDiscoutPrice(): number {
    return this.calculateSellingPrice() - this.data.estimation.totalDiscount
  }



  onClose() {
    this.dialogRef.close()
  }
}

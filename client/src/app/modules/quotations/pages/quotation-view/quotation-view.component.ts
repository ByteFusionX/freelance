import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationExtras, Router } from '@angular/router';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { ContactDetail, getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { Quotatation, getQuotatation, quotatationForm } from 'src/app/shared/interfaces/quotation.interface';
import { QuotationPreviewComponent } from '../quotation-preview/quotation-preview.component';

@Component({
  selector: 'app-quotation-view',
  templateUrl: './quotation-view.component.html',
  styleUrls: ['./quotation-view.component.css']
})
export class QuotationViewComponent {
  quoteData!: getQuotatation;
  isDownloading: boolean = false;
  isPreviewing: boolean = false;

  constructor(
    private _router: Router,
    private quotationService: QuotationService,
    private _dialog: MatDialog,
  ) {
    this.getQuoteData();
  }

  getQuoteData() {
    const navigation = this._router.getCurrentNavigation();

    if (navigation && navigation.extras.state) {
      this.quoteData = navigation.extras.state as getQuotatation
      console.log(this.quoteData)
    } else {
      this._router.navigate(['/quotations']);
    }
  }

  onQuoteEdit() {
    let quoteData: quotatationForm = this.quoteData;
    const navigationExtras: NavigationExtras = {
      state: quoteData
    };

    this._router.navigate(['/quotations/edit'], navigationExtras);
  }

  onDownloadPdf() {
    this.isDownloading = true;
    let quoteData: getQuotatation = this.quoteData;
    const pdfDoc = this.quotationService.generatePDF(quoteData)
    pdfDoc.then((pdf) => {
      pdf.download(quoteData.quoteId as string)
      this.isDownloading = false;
    })
  }

  onPreviewPdf() {
    this.isPreviewing = true;
    let quoteData: getQuotatation = this.quoteData;
    const pdfDoc = this.quotationService.generatePDF(quoteData)
    pdfDoc.then((pdf) => {
      pdf.getBlob((blob: Blob) => {
        let url = window.URL.createObjectURL(blob);
        this.isPreviewing = false;
        let dialogRef = this._dialog.open(QuotationPreviewComponent,
          {
            data: url
          });
      });
    });


  }

  calculateTotalCost(i: number, j: number) {
    return this.quoteData.items[i].itemDetails[j].quantity * this.quoteData.items[i].itemDetails[j].unitCost;
  }

  calculateUnitPrice(i: number, j: number) {
    const decimalMargin = this.quoteData.items[i].itemDetails[j].profit / 100;
    return this.quoteData.items[i].itemDetails[j].unitCost / (1 - decimalMargin)
  }

  calculateTotalPrice(i: number, j: number) {
    return this.calculateUnitPrice(i, j) * this.quoteData.items[i].itemDetails[j].quantity;
  }

  calculateAllTotalCost() {
    let totalCost = 0;
    this.quoteData.items.forEach((item, i) => {
      item.itemDetails.forEach((itemDetail, j) => {
        totalCost += this.calculateTotalCost(i, j)
      })
    })
    return totalCost;
  }

  calculateSellingPrice(): number {
    let totalCost = 0;
    this.quoteData.items.forEach((item, i) => {
      item.itemDetails.forEach((itemDetail, j) => {
        totalCost += this.calculateTotalPrice(i, j)
      })
    })
    return totalCost;
  }

  calculateTotalProfit(): number {
    return ((this.calculateSellingPrice() - this.calculateAllTotalCost()) / this.calculateSellingPrice() * 100) || 0
  }

  calculateDiscoutPrice(): number {
    return this.calculateSellingPrice() - this.quoteData.totalDiscount
  }


}

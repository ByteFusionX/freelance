import { HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationExtras, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import saveAs from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { QuotationPreviewComponent } from 'src/app/shared/components/quotation-preview/quotation-preview.component';
import { ContactDetail, getCustomer } from 'src/app/shared/interfaces/customer.interface';
import { getDepartment } from 'src/app/shared/interfaces/department.interface';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { Quotatation, getQuotatation, quotatationForm } from 'src/app/shared/interfaces/quotation.interface';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-quotation-view',
  templateUrl: './quotation-view.component.html',
  styleUrls: ['./quotation-view.component.css']
})
export class QuotationViewComponent {
  quoteData!: getQuotatation;
  isDownloading: boolean = false;
  isPreviewing: boolean = false;
  showRevision: boolean = false;
  isSaving: boolean = false;
  showError: boolean = false;
  revisionComment: string = '';
  progress: number = 0;
  subscriptions = new Subscription()


  constructor(
    private _router: Router,
    private quotationService: QuotationService,
    private _enquiryService: EnquiryService,
    private _dialog: MatDialog,
    private toast: ToastrService,
  ) {
    this.getQuoteData();
  }

  getQuoteData() {
    const navigation = this._router.getCurrentNavigation();

    if (navigation && navigation.extras.state) {
      this.quoteData = navigation.extras.state as getQuotatation;
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

  isReviseNeeded(){
    if(this.quoteData.enqId?.preSale && this.quoteData.status !== 'Won'){
      return true
    }
    return false
  }

  validateComments() {
    if (!this.revisionComment.trim()) {
      this.showError = true;
    } else {
      this.showError = false;
    }
  }

  onRevision() {
    this.showRevision = !this.showRevision;
    this.isSaving = false;
    // this.revisionComment = this.quoteData.enqId.preSale.estimations.presaleNote
  }

  onSubmit() {
    if (this.revisionComment && this.quoteData._id) {
      this.isSaving = true;
      this.subscriptions.add(
        this._enquiryService.quoteRevision(this.revisionComment, this.quoteData.enqId._id, this.quoteData._id).subscribe((res: any) => {
          if (res.success) {
            this.onRevision()
            this._router.navigate(['/quotations']);
          }
        })
      )
    } else {
      this.showError = true;
    }
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

  calculateProfitMargin(): number {
    return this.calculateSellingPrice() - this.calculateAllTotalCost() || 0
  }

  calculateTotalProfit(): number {
    return ((this.calculateSellingPrice() - this.calculateAllTotalCost()) / this.calculateSellingPrice() * 100) || 0
  }

  calculateDiscoutPrice(): number {
    return this.calculateSellingPrice() - this.quoteData.totalDiscount
  }

  deleteQuote() {
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Quote',
        description: 'Are you sure you want to delete this quote?',
        icon: 'heroExclamationCircle',
        IconColor: 'red'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.quotationService.deleteQuotation(this.quoteData._id!).subscribe({
          next: () => {
            this.toast.success('Quote deleted successfully');
            this._router.navigate(['/quotations']);
          },
          error: (error) => {
            this.toast.error(error.error.message || 'Failed to delete quote');
          }
        });
      }
    });
  }
  


}

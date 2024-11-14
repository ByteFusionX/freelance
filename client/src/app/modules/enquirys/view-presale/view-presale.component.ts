import { HttpEventType } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import saveAs from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { getEnquiry } from 'src/app/shared/interfaces/enquiry.interface';

@Component({
  selector: 'app-view-presale',
  templateUrl: './view-presale.component.html',
  styleUrls: ['./view-presale.component.css']
})
export class ViewPresaleComponent {
  showRevision: boolean = false;
  isSaving: boolean = false;
  showError: boolean = false;


  progress: number = 0;
  revisionComment: string = '';

  subscriptions = new Subscription()


  constructor(
    public dialogRef: MatDialogRef<ViewPresaleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: getEnquiry,
    private _enquiryService: EnquiryService,
    private _employeeService: EmployeeService,
    private _notificationService: NotificationService,
    private toast: ToastrService,
  ) { }

  ngOnInit(): void {
    
    this._employeeService.employeeData$.subscribe((data) => {
      if (data?._id) {
        if (this.data.preSale.seenbySalesPerson === false && this.data.salesPerson._id == data._id) {
          this._enquiryService.markAsSeenEstimation(this.data._id).subscribe((res: any) => {
            if (res.success) {
              this._notificationService.decrementNotificationCount('enquiry', 1)
            }
          })
        }
      }
    })
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
  }

  onSubmit() {
    if (this.revisionComment) {
      this.isSaving = true;
      this.subscriptions.add(
        this._enquiryService.sendRevision(this.revisionComment, this.data._id).subscribe((res: any) => {
          if (res.success) {
            this.dialogRef.close(true)
          }
        })
      )
    } else {
      this.showError = true;
    }
  }

  onDownloadClicks(file: any) {
    this.subscriptions.add(
      this._enquiryService.downloadFile(file.fileName)
        .subscribe({
          next: (event) => {
            if (event.type === HttpEventType.DownloadProgress) {
              this.progress = Math.round(100 * event.loaded / event.total);
            } else if (event.type === HttpEventType.Response) {
              const fileContent: Blob = new Blob([event['body']])
              saveAs(fileContent, file.originalname)
              this.clearProgress()
            }
          },
          error: (error) => {
            if (error.status == 404) {
              this.toast.warning('Sorry, The requested file was not found on the server. Please ensure that the file exists and try again.')
            }
          }
        })
    )
  }

  clearProgress() {
    setTimeout(() => {
      this.progress = 0
    }, 1000)
  }

  calculateTotalCost(i: number, j: number) {
    return this.data.preSale.estimations?.items[i].itemDetails[j].quantity * this.data.preSale.estimations?.items[i].itemDetails[j].unitCost;
  }

  calculateAllTotalCost() {
    let totalCost = 0;
    this.data.preSale.estimations?.items.forEach((item, i) => {
      item.itemDetails.forEach((itemDetail, j) => {
        totalCost += this.calculateTotalCost(i, j)
      })
    })
    return totalCost;
  }

  calculateSellingPrice(): number {
    let totalCost = 0;
    this.data.preSale.estimations?.items.forEach((item, i) => {
      item.itemDetails.forEach((itemDetail, j) => {
        totalCost += this.calculateTotalPrice(i, j)
      })
    })
    return totalCost;
  }

  calculateUnitPrice(i: number, j: number) {
    const decimalMargin = this.data.preSale.estimations?.items[i].itemDetails[j].profit / 100;
    return this.data.preSale.estimations?.items[i].itemDetails[j].unitCost / (1 - decimalMargin)
  }

  calculateTotalPrice(i: number, j: number) {
    return this.calculateUnitPrice(i, j) * this.data.preSale.estimations?.items[i].itemDetails[j].quantity;
  }

  calculateProfitMargin(): number {
    return this.calculateSellingPrice() - this.calculateAllTotalCost() || 0
  }

  calculateTotalProfit(): number {
    return ((this.calculateSellingPrice() - this.calculateAllTotalCost()) / this.calculateSellingPrice() * 100) || 0
  }

  calculateDiscoutPrice(): number {
    return this.calculateSellingPrice() - this.data.preSale.estimations?.totalDiscount
  }



  closeModal() {
    this.dialogRef.close()
  }
}

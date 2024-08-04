import { HttpEventType } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import saveAs from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
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
    private toast: ToastrService,
  ) { }


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
      this._enquiryService.downloadFile(file.filename)
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


  closeModal() {
    this.dialogRef.close()
  }
}

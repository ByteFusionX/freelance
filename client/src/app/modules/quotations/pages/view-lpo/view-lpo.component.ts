import { HttpEventType } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import saveAs from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';
import { ViewCommentComponent } from 'src/app/modules/assigned-jobs/pages/view-comment/view-comment.component';
import { Quotatation } from 'src/app/shared/interfaces/quotation.interface';

@Component({
  selector: 'app-view-lpo',
  templateUrl: './view-lpo.component.html',
  styleUrls: ['./view-lpo.component.css']
})
export class ViewLpoComponent {

  progress: number = 0
  constructor(
    private dialogRef: MatDialogRef<ViewCommentComponent>,
    @Inject(MAT_DIALOG_DATA) public data:Quotatation,
    private _enquiryService:EnquiryService,
    private toast: ToastrService,
  ) { }

  onClose() {
    this.dialogRef.close()
  }

  onDownloadClicks(file: any) {
    console.log(file)
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
  }

  clearProgress() {
    setTimeout(() => {
      this.progress = 0
    }, 1000)
  }
}

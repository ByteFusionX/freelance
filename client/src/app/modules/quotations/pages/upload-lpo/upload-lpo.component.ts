import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fileEnterState } from '../../../enquirys/enquiry-animations';
import { EmployeeService } from 'src/app/core/services/employee/employee.service';
import { Observable } from 'rxjs';
import { getEmployee } from 'src/app/shared/interfaces/employee.interface';
import { QuotationService } from 'src/app/core/services/quotation/quotation.service';
import { Quotatation } from 'src/app/shared/interfaces/quotation.interface';

@Component({
  selector: 'app-upload-lpo',
  templateUrl: './upload-lpo.component.html',
  styleUrls: ['./upload-lpo.component.css'],
  animations: [fileEnterState],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadLpoComponent implements OnInit {

  selectedFiles: File[] = []
  lpoFiles = []
  isClear: boolean = false
  error: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UploadLpoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Quotatation,
    private _quoationService: QuotationService
  ) { }

  ngOnInit(): void {
    this.lpoFiles = this.data.lpoFiles
    console.log(this.lpoFiles) 
    if (this.data) {
      this.isClear = true
    }
  }

  onClose() {
    this.dialogRef.close()
  }


  onFileUpload(event: File[]) {
    this.selectedFiles = event
    if (this.selectedFiles.length) {
      this.error = false
    }
  }

  onSubmit(isSubmitted: boolean) {
    if (this.selectedFiles.length && this.data) {
      let formData = new FormData();
      formData.append('quoteId', this.data._id as string)
      formData.append('isSubmitted', isSubmitted as unknown as string)
      for (let i = 0; i < this.selectedFiles.length; i++) {
        formData.append('files', this.selectedFiles[i] as Blob)
      }
      this._quoationService.uploadLpo(formData).subscribe((quote:Quotatation) => {
        if (quote) {
          if (isSubmitted) {
            this.dialogRef.close(quote)
          }
        }
      })
    } else {
      this.error = true
    }
  }

  onClear() {
    this.selectedFiles = []
  }
}

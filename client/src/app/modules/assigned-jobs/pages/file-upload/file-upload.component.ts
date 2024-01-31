import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EnquiryService } from 'src/app/core/services/enquiry/enquiry.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {

  selectedFiles: File[] = []
  constructor(
    private dialogRef: MatDialogRef<FileUploadComponent>,
    private _enquiryService: EnquiryService,
    @Inject(MAT_DIALOG_DATA) public data: string,
  ) { }

  onClose() {
    this.dialogRef.close()
  }

  onUpload() {
    let totalFiles = this.selectedFiles.length
    if (totalFiles > 0) {
      let formData = new FormData()
      formData.append('enquiryId', this.data)
      for (let i = 0; i < totalFiles; i++) {
        formData.append('assignFiles', this.selectedFiles[i])
      }
      this._enquiryService.uploadAssignedFiles(formData).subscribe((data) => {
        if (data) {
          this.dialogRef.close(data)
        }
      })
    }
  }

  onFileUpload(event: File[]) {
    this.selectedFiles = event
  }
}
